import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fulfillPurchase } from "@/lib/checkout";
import { processPaymentCommission } from "@/lib/commission";
import { sendUnderPaidNotification } from "@/lib/email";
import crypto from "crypto";

/**
 * 🛡️ FINANCIAL SECURITY WEBHOOK (COINREMITTER)
 * 1. Signature Auth: Calculates MD5(sorted_body + API_PASSWORD) to verify caller.
 * 2. Idempotency: Restricts updates to PENDING orders only.
 * 3. Mapping: Verifies invoice_id against database to prevent injection.
 * 4. The Oracle Pattern: Re-verifies status directly with CoinRemitter API.
 * 5. Under-Paid Logic: Tracks partial payments and sends automated email.
 * 6. Commission Support: Calls processPaymentCommission for seller earnings.
 */
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const body: Record<string, any> = {};
        formData.forEach((value, key) => {
            body[key] = value.toString();
        });

        const invoice_id = body.invoice_id;
        const order_id = body.custom_data1; // We stored order.id here
        const received_hash = body.hash;
        
        if (!invoice_id || !order_id) {
            console.error("[CRITICAL]: Missing identity fields in webhook", { invoice_id, order_id });
            return NextResponse.json({ error: "Missing identity fields" }, { status: 400 });
        }

        const apiKey = process.env.COINREMITTER_API_KEY;
        const apiPassword = process.env.COINREMITTER_PASSWORD; 

        // 🛡️ SECURITY 1: Signature Verification (MD5)
        if (apiPassword && received_hash) {
            const { hash, ...dataToSign } = body;
            const sortedKeys = Object.keys(dataToSign).sort();
            let signString = "";
            for (const key of sortedKeys) {
                if (dataToSign[key] != null) signString += dataToSign[key];
            }
            const expectedHash = crypto.createHash("md5").update(signString + apiPassword).digest("hex");
            if (expectedHash !== received_hash) {
                console.warn(`[FRAUD ALERT]: Invalid webhook signature for invoice ${invoice_id}`);
                return NextResponse.json({ error: "Unauthorized source (Signature Mismatch)" }, { status: 403 });
            }
        }

        // 🛡️ SECURITY 2: Strict Idempotency Check
        const order = await prisma.order.findUnique({
            where: { id: order_id },
            select: { 
                id: true, 
                orderNumber: true,
                status: true, 
                customerName: true,
                customerEmail: true,
                cryptoInvoiceId: true, 
                userId: true, 
                totalAmount: true 
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Verify invoice mapping
        if (order.cryptoInvoiceId && order.cryptoInvoiceId !== invoice_id) {
            console.warn(`[FRAUD ALERT]: Webhook invoice_id mismatch. Received ${invoice_id}, Expected ${order.cryptoInvoiceId}`);
            return NextResponse.json({ error: "Identity Fraud Detected" }, { status: 403 });
        }

        // Only process PENDING orders
        if (order.status !== "PENDING") {
            return NextResponse.json({ success: true, message: `Order already in ${order.status} state` });
        }

        if (!apiKey || !apiPassword) {
            console.error("[CRITICAL]: CoinRemitter keys missing!");
            return NextResponse.json({ error: "Verification unavailable" }, { status: 500 });
        }

        // 🛡️ SECURITY 3: "The Oracle Pattern" (Verify directly with Source)
        const verifyUrl = "https://coinremitter.com/api/v3/USDTTRC20/get-invoice";
        const verifyRes = await fetch(verifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                password: apiPassword,
                invoice_id: invoice_id
            })
        });

        const vRes = await verifyRes.json();
        if (vRes.flag !== 1 || !vRes.data) {
            console.warn(`[Suspicious Webhook]: Oracle verification failed for invoice ${invoice_id}`);
            return NextResponse.json({ error: "Fraud detected or API failure" }, { status: 403 });
        }

        const verifyData = vRes.data;
        const realStatus = verifyData.status; 
        const paidAmountFloat = parseFloat(verifyData.paid_amount || "0");
        const totalAmountFloat = parseFloat(verifyData.total_amount?.USDT || verifyData.total_amount?.total || "0");

        // 💰 REVENUE LOGIC
        if (realStatus === "Paid" || realStatus === "Over Paid") {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "COMPLETED",
                    isPaid: true,
                    paidAt: new Date(),
                    cryptoStatus: realStatus,
                    cryptoPaidAmount: paidAmountFloat,
                    cryptoTotalAmount: totalAmountFloat
                }
            });

            await processPaymentCommission(order.id);
            await fulfillPurchase(order.id, order.userId);

            console.log(`[SUCCESS]: Payment fulfilled for order ${order.orderNumber}`);
            return NextResponse.json({ success: true });

        } else if (realStatus === "Under Paid") {
            const remaining = totalAmountFloat - paidAmountFloat;
            const paidRatio = paidAmountFloat / totalAmountFloat;

            // 🛡️ FINANCIAL LOGIC: 0.5% Under-payment Tolerance
            if (paidRatio >= 0.995) {
                console.log(`[TOLERANCE]: Order ${order.orderNumber} under-paid by only ${(1 - paidRatio) * 100}%. Accepting payment.`);
                
                await prisma.order.update({
                    where: { id: order.id },
                    data: {
                        status: "COMPLETED",
                        isPaid: true,
                        paidAt: new Date(),
                        cryptoStatus: "Paid (Under-payment Tolerated)",
                        cryptoPaidAmount: paidAmountFloat,
                        cryptoTotalAmount: totalAmountFloat,
                        paymentNotes: `Accepted with 0.5% tolerance. Missing: ${remaining.toFixed(6)} USDT.`
                    }
                });

                await processPaymentCommission(order.id);
                await fulfillPurchase(order.id, order.userId);
                return NextResponse.json({ success: true, message: "Accepted within tolerance." });
            }

            const percentage = paidRatio * 100;

            await prisma.order.update({
                where: { id: order.id },
                data: { 
                    cryptoStatus: `Under Paid (${percentage.toFixed(1)}% paid)`,
                    paymentNotes: `Paid: ${paidAmountFloat}, Required: ${totalAmountFloat}. Remaining: ${remaining.toFixed(2)} USDT.`,
                    cryptoPaidAmount: paidAmountFloat,
                    cryptoTotalAmount: totalAmountFloat
                }
            });

            // 📧 Send Notification to customer
            await sendUnderPaidNotification({
                to: order.customerEmail,
                customerName: order.customerName,
                orderNumber: order.orderNumber,
                paidAmount: paidAmountFloat,
                totalAmount: totalAmountFloat,
                remaining: remaining
            });

            return NextResponse.json({ success: true, message: "Under-payment recorded and customer notified." });

        } else if (realStatus === "Expired" || realStatus === "Cancelled") {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "CANCELLED", cryptoStatus: realStatus }
            });
            return NextResponse.json({ success: true, message: "Order marked as cancelled." });
        } else {
            await prisma.order.update({
                where: { id: order.id },
                data: { cryptoStatus: realStatus }
            });
            return NextResponse.json({ success: true, message: `Status: ${realStatus}` });
        }

    } catch (error) {
        console.error("[CoinRemitter Webhook Error]:", error);
        return NextResponse.json({ error: "Infrastructure failure" }, { status: 500 });
    }
}
