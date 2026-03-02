import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendManualOrderApproved } from '@/lib/email';
// import { sendTelegramMessage } from '@/lib/telegram'; // Uncomment if you have a configured telegram utility

export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication / Authorization
        const authHeader = req.headers.get('authorization');
        const configuredSecret = process.env.SMS_WEBHOOK_SECRET;

        // Ensure a secret is configured and matches the incoming request (e.g. "Bearer YOUR_SECRET")
        if (!configuredSecret) {
            console.error('CRITICAL: SMS_WEBHOOK_SECRET is not configured in environment variables.');
            return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
        }

        if (authHeader !== `Bearer ${configuredSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('Incoming SMS Webhook Data:', body);

        const smsText = body.text || body.message || '';
        const sender = body.sender || '';

        if (!smsText) {
            return NextResponse.json({ error: 'No SMS body provided' }, { status: 400 });
        }

        // 2. Parse the SMS for Reference IDs (Extraction Logic)
        // This Regex matches typical 6-12 digit numbers from Syrian Telecoms (Syriatel Cash / Zain Cash)
        const regex = /\b\d{6,12}\b/g;
        const matches = smsText.match(regex);
        let extractedRefs: string[] = [];

        if (matches) {
            // Filter to ensure it has at least one number (ignoring plain word matches)
            extractedRefs = Array.from(new Set(matches)).filter((m): m is string => typeof m === 'string' && /\d/.test(m));
        }

        if (extractedRefs.length === 0) {
            // Optional: Alert Admin that an SMS was received but couldn't be parsed
            // await sendTelegramMessage(process.env.TELEGRAM_CHAT_ID, `⚠️ SMS without detectable Reference ID:\n${smsText}`);
            return NextResponse.json({ success: true, message: 'SMS received but no reference ID could be extracted.' });
        }

        // 3. Search and Match in Database
        // Look for any PENDING manual orders whose transactionRef matches the extracted IDs
        const matchedOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                paymentMethod: 'manual',
                transactionRef: { in: extractedRefs }
            }
        });

        if (matchedOrders.length === 0) {
            // Alert Admin: Payment arrived but no student order has been submitted yet or wrong ID utilized.
            // await sendTelegramMessage(process.env.TELEGRAM_CHAT_ID, `⚠️ Unmatched Payment!\nSMS: ${smsText}\nExtracted IDs: ${extractedRefs.join(', ')}`);
            return NextResponse.json({
                success: true,
                message: 'No matching pending orders found for these references.',
                refs: extractedRefs
            });
        }

        // 4. Auto-Approve the Order(s)
        const matchedOrderIds = matchedOrders.map(o => o.id);

        await prisma.order.updateMany({
            where: {
                id: { in: matchedOrderIds }
            },
            data: {
                status: 'PAID',
                isPaid: true,
                paidAt: new Date(),
                verifiedAt: new Date()
            }
        });

        // 5. Trigger Post-Approval Logic (Emails to User)
        // Fetch the full order details for the payload
        const updatedOrders = await prisma.order.findMany({
            where: { id: { in: matchedOrderIds } },
            include: {
                user: true,
                items: {
                    include: {
                        product: true,
                        course: true,
                        bundle: true
                    }
                }
            }
        });

        for (const order of updatedOrders) {
            if (order.customerEmail) {
                // Send digital access email to the user
                try {
                    await sendManualOrderApproved({
                        to: order.customerEmail,
                        customerName: order.customerName,
                        orderNumber: order.orderNumber,
                        amount: order.totalAmount
                    });
                } catch (emailError) {
                    console.error(`Failed to send approval email for order ${order.orderNumber}`, emailError);
                }
            }
        }

        // Optional: Alert Admin that a successful automated matching occurred
        // await sendTelegramMessage(process.env.TELEGRAM_CHAT_ID, `✅ Auto-Matched Payment!\nOrder: ${matchedOrders[0].orderNumber}\nReference: ${matchedOrders[0].transactionRef}`);

        return NextResponse.json({
            success: true,
            message: `Successfully verified and approved ${matchedOrders.length} order(s).`,
            verifiedOrders: matchedOrders.map(o => o.orderNumber)
        });

    } catch (error) {
        console.error('SMS Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
