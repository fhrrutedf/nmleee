import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const invoice_id = formData.get("invoice_id")?.toString();
        const custom_data1 = formData.get("custom_data1")?.toString(); // We sent order.id here
        const status = formData.get("status")?.toString(); // Expected "Paid", "Pending", "Cancelled"
        const address = formData.get("address")?.toString();

        if (!invoice_id || !custom_data1) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: custom_data1 }
        });

        if (!order || order.cryptoInvoiceId !== invoice_id) {
            return NextResponse.json({ error: "Order not found or invoice mismatch" }, { status: 404 });
        }

        // CoinRemitter statuses: "Pending", "Paid", "Under Paid", "Over Paid", "Expired", "Cancelled"
        const statusLower = status?.toLowerCase() || '';

        if (statusLower === 'paid' || statusLower === 'over paid') {
            // Update order to paid
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "COMPLETED",
                    isPaid: true,
                    paidAt: new Date(),
                    cryptoStatus: status,
                }
            });

            // Handle successful payment logic like sending email or granting access
            // ... (implement your fulfill order logic here if any, similar to Stripe)

        } else {
            // Update status only
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    cryptoStatus: status,
                }
            });
        }

        return NextResponse.json({ success: true, message: "Webhook received successfully" });
    } catch (error) {
        console.error("CoinRemitter Webhook Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
