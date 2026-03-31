import { prisma } from '@/lib/db';
import { triggerWelcomeEmail, triggerSellerNotification } from '@/lib/automation-helpers';
import { sendOrderConfirmation } from '@/lib/email';

/**
 * دالة تفعيل المشتريات (Fulfillment)
 * تقوم بفتح الدورات للطلاب، وتحديث الأرصدة، وإرسال الإشعارات
 * @param orderId معرف الطلب
 * @param userId معرف المستخدم المشتري (اختياري، يتم جلبه من الطلب إذا لم يتوفر)
 */
export async function fulfillPurchase(orderId: string, userId?: string) {
    console.log(`[CHECKOUT_FULFILL] Starting fulfillment for order: ${orderId}`);
    
    try {
        // 1. جلب الطلب مع كافة التفاصيل الضرورية
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                        course: true,
                        bundle: {
                            include: {
                                products: {
                                    include: {
                                        product: true
                                    }
                                }
                            }
                        }
                    }
                },
                user: true,
                seller: true,
                coupon: true,
                affiliateLink: true,
            }
        });

        if (!order) {
            console.error(`[FULFILL_ERROR] Order ${orderId} not found in database.`);
            return { success: false, error: 'Order not found' };
        }

        // إذا كان الطلب مكتملاً بالفعل، نتخطى التفعيل لتجنب التكرار (إلا لو لزم الأمر)
        // ملاحظة: قد يكون الطلب PAID ولكن ليس COMPLETED بعد
        
        const studentEmail = order.customerEmail.toLowerCase().trim();
        const studentName = order.customerName || order.user?.name || 'العميل';

        // 2. معالجة العناصر (تفعيل الدورات)
        console.log(`[CHECKOUT_FULFILL] Processing ${order.items.length} items for ${studentEmail}`);
        
        for (const item of order.items) {
            try {
                // أ. دورة تدريبية (Course)
                if (item.itemType === 'course' && item.courseId) {
                    await enrollInCourse(item.courseId, studentEmail, studentName, order.id);
                    console.log(`   - Enrolled in course: ${item.courseId}`);
                } 
                // ب. باقة (Bundle)
                else if (item.itemType === 'bundle' && item.bundleId && item.bundle) {
                    for (const bp of item.bundle.products) {
                        // الباقة قد تحتوي على منتجات من نوع كورس (Course)
                        // نتحقق من التصنيف أو النوع (في قاعدة البيانات السابقة كانت تعامل كمنتجات)
                        if (bp.product.category === 'courses' || bp.product.category === 'course') {
                            await enrollInCourse(bp.product.id, studentEmail, studentName, order.id);
                            console.log(`   - Enrolled in bundle course: ${bp.product.id}`);
                        }
                    }
                }
                // ج. منتجات رقمية (Digital Product)
                else if (item.itemType === 'product' && item.productId) {
                    // الوصول للمنتجات الرقمية يتم عادة عبر عرض الطلبات، لا يحتاج جدول تسجيل خاص مثل الكورسات
                    console.log(`   - Product purchase noted: ${item.productId}`);
                }
                // د. اشتراك منصة (SaaS Subscription)
                else if (item.itemType === 'subscription' && item.licenseKeyId) {
                    // Start of SaaS Subscription Activation Routine
                    await activatePlatformSubscription(item.licenseKeyId, order.userId, order.id);
                    console.log(`   - Activated platform subscription: ${item.licenseKeyId}`);
                }
            } catch (itemErr) {
                console.error(`[FULFILL_ITEM_ERROR] Failed to process item:`, itemErr);
            }
        }

        // 3. تحديث ميزانية البائع (Escrow System)
        // نقوم بذلك فقط إذا كان هناك حصة للبائع ولم يتم تحديثها سابقاً (عن طريق processPaymentCommission)
        if (order.sellerId && order.sellerAmount > 0 && order.payoutStatus !== 'pending') {
            await prisma.user.update({
                where: { id: order.sellerId },
                data: {
                    pendingBalance: { increment: order.sellerAmount },
                    totalEarnings: { increment: order.sellerAmount },
                }
            });
            console.log(`[CHECKOUT_FULFILL] Updated seller balance: +${order.sellerAmount}`);
        } else if (order.payoutStatus === 'pending') {
            console.log(`[CHECKOUT_FULFILL] Seller balance already updated by commission module.`);
        }

        // 4. إرسال إشعارات البريد الإلكتروني
        try {
            // أ. تأكيد الطلب للعميل
            await sendOrderConfirmation({
                to: studentEmail,
                customerName: studentName,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                items: order.items.map(i => ({
                    title: i.course?.title || i.product?.title || i.bundle?.title || 'منتج رقمي',
                    price: i.price
                }))
            });
            console.log(`[CHECKOUT_FULFILL] Order confirmation email sent to student.`);

            // ب. أتمتة الرسائل الترحيبية (إذا مفعّلة لدى البائع)
            if (order.sellerId) {
                await triggerWelcomeEmail({
                    customerEmail: studentEmail,
                    customerName: studentName,
                    sellerId: order.sellerId,
                    productName: order.items[0]?.course?.title || order.items[0]?.product?.title || 'منتجنا'
                });

                // ج. إشعار البائع بالبيع
                const couponText = order.coupon ? ` باستخدام كود الخصم (${order.coupon.code})` : '';
                await triggerSellerNotification({
                    sellerId: order.sellerId,
                    type: 'sale',
                    title: 'عملية بيع جديدة! 💰',
                    content: `مبروك! لقد بعت "${order.items[0]?.course?.title || order.items[0]?.product?.title || 'منتج'}" بقيمة ${order.totalAmount} $${couponText}`,
                    payload: {
                        amount: order.totalAmount,
                        customerName: studentName,
                        productTitle: order.items[0]?.course?.title || order.items[0]?.product?.title || 'منتج',
                        couponCode: order.coupon?.code
                    }
                });

                // د. تحديث إحصائيات الأفلييت (Affiliate Stats)
                if (order.affiliateLinkId) {
                    const affLink = await prisma.affiliateLink.findUnique({
                        where: { id: order.affiliateLinkId }
                    });

                    if (affLink) {
                        const newSalesCount = affLink.salesCount + 1;
                        await prisma.affiliateLink.update({
                            where: { id: affLink.id },
                            data: {
                                salesCount: { increment: 1 },
                                revenue: { increment: order.totalAmount },
                                // Logic for tiered commission could be added here for future sales
                            }
                        });

                        // د.٢ تسجيل عملية البيع في السجل (Ledger)
                        const commissionAmount = affLink.commissionType === 'percentage' 
                            ? (order.totalAmount * affLink.commissionValue) / 100
                            : affLink.commissionValue;

                        await prisma.affiliateSale.create({
                            data: {
                                linkId: affLink.id,
                                orderId: order.id,
                                amount: order.totalAmount,
                                commission: commissionAmount,
                                status: 'pending', // Will be confirmed later by admin
                            }
                        });

                        // Check tier threshold
                        if (affLink.tierThreshold && newSalesCount >= affLink.tierThreshold && affLink.tierValue) {
                            console.log(`[AFFILIATE_UPGRADE] Link ${affLink.code} reached tier!`);
                        }
                    }
                }
                
                console.log(`[CHECKOUT_FULFILL] Notifications sent to seller.`);
            }
        } catch (noticeErr) {
            console.error(`[FULFILL_NOTIFICATION_ERROR]`, noticeErr);
            // لا نعطل العملية بسبب فشل إرسال الإيميل
        }

        // 5. تحديث حالة الطلب لـ COMPLETED إذا لزم الأمر
        if (order.status !== 'COMPLETED') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'COMPLETED' }
            });
        }

        console.log(`[CHECKOUT_FULFILL] Fulfillment completed successfully for ${orderId}`);
        return { success: true };

    } catch (error) {
        console.error(`[CHECKOUT_FULFILL_CRITICAL_ERROR] Order ${orderId}:`, error);
        return { success: false, error: 'Internal fulfillment error' };
    }
}

/**
 * دالة مساعدة لتسجيل الطالب في كورس وتجنب تكرار الكود
 */
async function enrollInCourse(courseId: string, studentEmail: string, studentName: string, orderId: string) {
    return prisma.courseEnrollment.upsert({
        where: {
            courseId_studentEmail: {
                courseId,
                studentEmail
            }
        },
        update: {
            orderId,
            updatedAt: new Date()
        },
        create: {
            courseId,
            studentName,
            studentEmail,
            orderId
        }
    });
}

/**
 * دالة مساعدة لتنشيط أو تجديد اشتراك الساس (SaaS Platform Subscription)
 * تقوم بإضافة المدة بناءً على خطة الدفع الخاصة بالباقة (شهر أو سنة).
 */
async function activatePlatformSubscription(planId: string, customerId: string, orderId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        console.error(`[SUBSCRIPTION_ERROR] Plan ${planId} not found`);
        return;
    }

    // Determine end date
    const now = new Date();
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now);
    
    if (plan.interval === 'year') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else if (plan.interval === 'lifetime') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 100);
    } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Upsert the subscription (create active or extend existing if exists)
    // Note: Schema has array of customer Subscriptions, not unique per customer/plan
    // But logically we want to find the latest active one and extend it, or just create a new one.
    
    // Check if user has an existing active subscription
    const existingSub = await prisma.subscription.findFirst({
        where: { customerId, status: 'active' },
        orderBy: { currentPeriodEnd: 'desc' }
    });

    if (existingSub) {
        // If renewing, extend from the END DATE of their current plan, or NOW if it's already expired
        const extendDate = existingSub.currentPeriodEnd > now ? existingSub.currentPeriodEnd : now;
        const newExpiration = new Date(extendDate);
        if (plan.interval === 'year') newExpiration.setFullYear(newExpiration.getFullYear() + 1);
        else if (plan.interval === 'lifetime') newExpiration.setFullYear(newExpiration.getFullYear() + 100);
        else newExpiration.setMonth(newExpiration.getMonth() + 1);

        // Update to new plan & new date
        await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
                planId: plan.id,
                currentPeriodStart: now,
                currentPeriodEnd: newExpiration,
                status: 'active'
            }
        });
        
    } else {
        // Create brand new
        await prisma.subscription.create({
            data: {
                customerId,
                planId: plan.id,
                status: 'active',
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd: false
            }
        });
    }
    
    // Also inject their plan type context into User struct for legacy compatibility
    // استخدام planType من DB مباشرة بدلاً من البحث في الاسم
    const updatedPlanType = (plan.planType || 'GROWTH').toUpperCase();
    
    await prisma.user.update({
        where: { id: customerId },
        data: { 
            planType: updatedPlanType as any,
            planExpiresAt: currentPeriodEnd  // تحديث تاريخ انتهاء الاشتراك
        }
    });
}
