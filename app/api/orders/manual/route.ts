import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPaymentMethodsForCountry, convertCurrency } from '@/config/paymentMethods';
import { sendManualOrderAlert, sendManualOrderApproved } from '@/lib/email';
import { getPlatformSettings, calculateCommission } from '@/lib/commission';
import { ensureUserAccount } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            items,
            customerName,
            customerEmail,
            customerPhone,
            country,
            paymentProvider,
            senderPhone,
            transactionRef,
            paymentProof,
            paymentNotes,
            userId,
            affiliateRef, // Code from cookie/storage
        } = body;

        // 1. SECURITY: Check for duplicate transaction reference
        if (transactionRef) {
            const existingOrder = await prisma.order.findFirst({
                where: { transactionRef }
            });
            if (existingOrder) {
                const { getClientIp, logActivity, LOG_ACTIONS } = await import('@/lib/activity-log');
                const { sendTelegramAlert, AuditTemplates } = await import('@/lib/telegram');
                
                await logActivity({
                    action: LOG_ACTIONS.PAYMENT_FAILED,
                    details: { error: 'Duplicate Transaction Ref', ref: transactionRef },
                    ipAddress: getClientIp(req),
                });
                
                await sendTelegramAlert(AuditTemplates.failure('دفع متكرر', `محاولة استخدام إيصال مستخدم سابقاً: ${transactionRef}`));
                
                return NextResponse.json({ error: 'رقم العملية هذا تم استخدامه مسبقاً (محاولة تكرار)' }, { status: 400 });
            }
        }

        // 2. SECURITY & LOGIC: Calculate total and resolve sellers strictly from DB
        let totalUSD = 0;
        const validatedItems = [];
        let sellerId = null;

        for (const item of items) {
            let dbItem;
            if (item.type === 'product') {
                dbItem = await prisma.product.findUnique({
                    where: { id: item.id },
                    select: { id: true, price: true, userId: true, title: true }
                });
            } else if (item.type === 'course') {
                dbItem = await prisma.course.findUnique({
                    where: { id: item.id },
                    select: { id: true, price: true, userId: true, title: true }
                });
            }

            if (!dbItem) {
                return NextResponse.json({ error: `المنتج غير موجود: ${item.id}` }, { status: 404 });
            }

            // Always use DB price, ignore client price
            const price = dbItem.price || 0;
            totalUSD += price;
            
            validatedItems.push({
                ...item,
                price: price, // Server-side validated price
                title: dbItem.title,
                userId: dbItem.userId
            });

            // Set main sellerId from first item (simplified for now)
            if (!sellerId) sellerId = dbItem.userId;
        }

        // 3. LOGIC: Calculate commission
        const platformSettings = await getPlatformSettings();
        const { platformFee, sellerAmount } = calculateCommission(totalUSD, platformSettings.commissionRate);
        const escrowDays = platformSettings.escrowDays;

        // 4. LOGIC: Resolve buyer userId strictly
        let resolvedUserId = body.userId;
        if (!resolvedUserId && customerEmail) {
            resolvedUserId = await ensureUserAccount(customerEmail, customerName);
        }
        if (!resolvedUserId) {
            resolvedUserId = sellerId; // fallback
        }

        // 5. SECURITY: Generate Signed URL for admin if proof is private
        // Assumes paymentProof is a Supabase storage path or public URL
        let adminProofUrl = paymentProof;
        try {
            if (paymentProof && !paymentProof.startsWith('http')) {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );
                
                // Assuming payments are in 'payments' bucket
                const { data: signedData } = await supabase.storage
                    .from('product-files') // Based on app/api/upload bucket logic
                    .createSignedUrl(paymentProof, 86400); // 24 hours for admin review
                
                if (signedData?.signedUrl) adminProofUrl = signedData.signedUrl;
            }
        } catch (e) {
            console.error('Failed to generate signed URL for admin:', e);
        }

        // 6. DB: Create order with validated data
        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}`,
                customerName,
                customerEmail,
                customerPhone: customerPhone || '',
                totalAmount: totalUSD,
                platformFee,
                sellerAmount,
                status: 'PENDING',
                paymentMethod: 'manual',
                paymentProvider,
                paymentCountry: country,
                senderPhone,
                transactionRef,
                paymentProof, // Save original path/url
                paymentNotes,
                userId: resolvedUserId,
                sellerId: sellerId || undefined,
                affiliateLinkId: affiliateRef ? (await prisma.affiliateLink.findUnique({ where: { code: affiliateRef.toUpperCase() } }))?.id : undefined,
                payoutStatus: 'pending',
                availableAt: new Date(Date.now() + escrowDays * 24 * 60 * 60 * 1000),
                items: {
                    create: validatedItems.map((item) => ({
                        itemType: item.type,
                        productId: item.type === 'product' ? item.id : undefined,
                        courseId: item.type === 'course' ? item.id : undefined,
                        quantity: 1,
                        price: item.price, // FIXED: Now uses validated price
                    })),
                },
            },
        });

        // 7. NOTIFICATIONS: Correct workflow
        // Alert Admin with Signed URL
        const { sendManualOrderAlert, sendManualOrderReview } = await import('@/lib/email');
        
        await sendManualOrderAlert({
            adminEmail: process.env.ADMIN_EMAIL || 'admin@tmleen.com',
            adminName: 'Admin',
            orderNumber: order.orderNumber,
            customerName: customerName,
            customerEmail: customerEmail,
            amount: totalUSD,
            paymentMethod: `${paymentProvider} (${country})`,
            orderId: order.id,
            proofUrl: adminProofUrl,
        });

        // Notify Customer: RECEIVED, NOT APPROVED
        await sendManualOrderReview({
            to: customerEmail,
            customerName: customerName,
            orderNumber: order.orderNumber,
            amount: totalUSD,
        });

        return NextResponse.json({
            success: true,
            orderNumber: order.orderNumber,
            orderId: order.id,
        });

        return NextResponse.json({
            success: true,
            orderNumber: order.orderNumber,
            orderId: order.id,
        });
    } catch (error: any) {
        console.error('Error creating manual order:', error);
        
        // LOG FAILURE: Lost Opportunity
        try {
            const { logActivity, LOG_ACTIONS, getClientIp } = await import('@/lib/activity-log');
            const { sendTelegramAlert, AuditTemplates } = await import('@/lib/telegram');
            
            await logActivity({
                action: LOG_ACTIONS.PAYMENT_FAILED,
                details: { error: error.message, stack: error.stack },
                ipAddress: getClientIp(req),
            });

            await sendTelegramAlert(AuditTemplates.failure('طلب يدوي', error.message));
        } catch (e) {
            console.error('Critical log failure:', e);
        }

        return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الطلب' }, { status: 500 });
    }
}
