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
                await triggerSellerNotification({
                    sellerId: order.sellerId,
                    type: 'sale',
                    title: 'عملية بيع جديدة! 💰',
                    content: `قام ${studentName} بشراء "${order.items[0]?.course?.title || order.items[0]?.product?.title || 'منتج'}" بقيمة ${order.totalAmount} ج.م`,
                    payload: {
                        amount: order.totalAmount,
                        customerName: studentName,
                        productTitle: order.items[0]?.course?.title || order.items[0]?.product?.title || 'منتج'
                    }
                });
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
