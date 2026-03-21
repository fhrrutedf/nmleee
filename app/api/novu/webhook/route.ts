import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logActivity, LOG_ACTIONS, getClientIp } from '@/lib/activity-log';
import { sendTelegramAlert, AuditTemplates } from '@/lib/telegram';
import crypto from 'crypto';

/**
 * Webhook endpoint لاستقبال أحداث من Novu
 * الأمن: يتم استخدام NOVU_WEBHOOK_SECRET للتحقق من صحة المرسل
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const signature = request.headers.get('novu-signature');
        const secret = process.env.NOVU_WEBHOOK_SECRET;

        // 1. SECURITY: Verify Signature
        if (secret && signature) {
            const hmac = crypto.createHmac('sha256', secret);
            const expectedSignature = hmac.update(JSON.stringify(body)).digest('hex');
            
            if (signature !== expectedSignature) {
                console.error('❌ Novu Webhook: Invalid Signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        } else if (secret && !signature) {
             return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // 2. LOGIC: Handle Events
        console.log('📨 Novu Event:', body.type, body.payload?.orderNumber || '');

        // Handle Delivery Success
        if (body.type === 'notification_delivered') {
            console.log(`✅ Notification delivered: ${body.step?.name} to ${body.subscriber?.email}`);
        }

        // Handle Delivery Failure (CRITICAL)
        if (body.type === 'notification_failed') {
            const errorMsg = body.error || 'Unknown error';
            const subscriber = body.subscriber?.email || 'Unknown';
            const stepName = body.step?.name || 'Unknown Step';

            console.error(`❌ Notification failed: ${stepName} to ${subscriber}. Error: ${errorMsg}`);

            // Log to Activity System
            await logActivity({
                action: 'platform.notification_failed',
                details: { 
                    subscriber, 
                    stepName, 
                    error: errorMsg,
                    payload: body.payload 
                },
                ipAddress: getClientIp(request)
            });

            // Alert Admin via Telegram if it's a critical notification (e.g., Sales, Order)
            if (stepName.includes('order') || stepName.includes('payment') || stepName.includes('seller')) {
                await sendTelegramAlert(
                    `⚠️ <b>فشل إرسال إشعار:</b>\n👤 المستلم: ${subscriber}\n⚡ الحدث: ${stepName}\n❌ الخطأ: ${errorMsg}`
                );
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('❌ Novu webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
