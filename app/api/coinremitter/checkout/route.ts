import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerEmail, customerName, couponCode, appointmentDetails, affiliateRef, totalAmountInUsd } = body;

        let calculatedTotal = totalAmountInUsd || 0;

        if (calculatedTotal <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Determine seller/user ID from the first item
        let userId = '';
        if (items && items.length > 0) {
            const firstItem = items[0];
            if (firstItem.type === 'product') {
                const product = await prisma.product.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
                userId = product?.userId || '';
            } else if (firstItem.type === 'course') {
                const course = await prisma.course.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
                userId = course?.userId || '';
            } else if (firstItem.sellerId) {
                userId = firstItem.sellerId;
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "لا يمكن تحديد البائع للطلب" }, { status: 400 });
        }

        // 1. Create a pending order in database
        const orderNumber = "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();

        const newOrder = await prisma.order.create({
            data: {
                orderNumber,
                customerName,
                customerEmail,
                totalAmount: calculatedTotal,
                status: "PENDING",
                paymentMethod: "CRYPTO_USDT",
                sellerId: userId,
                userId: userId,
            }
        });

        // Save items
        for (const item of items) {
            await prisma.orderItem.create({
                data: {
                    orderId: newOrder.id,
                    price: item.price,
                    quantity: 1,
                    itemType: item.type || "product",
                    productId: item.type === "product" ? item.id : null,
                    courseId: item.type === "course" ? item.id : null,
                }
            });
        }

        // 2. Call CoinRemitter API
        const apiKey = process.env.COINREMITTER_API_KEY;
        const password = process.env.COINREMITTER_PASSWORD;
        const baseUrl = "https://coinremitter.com/api/v3/USDTTRC20/create-invoice";

        if (!apiKey || !password) {
            return NextResponse.json({ error: "Crypto payments not configured" }, { status: 500 });
        }

        const notifyUrl = `${process.env.NEXTAUTH_URL || "https://nmleee-9qri.vercel.app"}/api/coinremitter/webhook`;

        const requestBody = {
            api_key: apiKey,
            password: password,
            amount: calculatedTotal,
            notify_url: notifyUrl,
            name: `Order ${orderNumber}`,
            currency: "USD",
            expire_time: "30",
            custom_data1: newOrder.id
        };

        const apiRes = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await apiRes.json();

        if (data.flag === 1) {
            const invoiceData = data.data;
            await prisma.order.update({
                where: { id: newOrder.id },
                data: {
                    cryptoInvoiceId: invoiceData.invoice_id,
                    cryptoAmount: parseFloat(invoiceData.total_amount[invoiceData.coin]),
                    cryptoCoin: invoiceData.coin,
                    walletAddress: invoiceData.address,
                    cryptoStatus: invoiceData.status || "Pending",
                }
            });

            return NextResponse.json({
                success: true,
                orderId: newOrder.id,
                url: invoiceData.url // They provide an invoice page
            });
        } else {
            console.error("CoinRemitter error:", data);
            return NextResponse.json({ error: data.msg || "Failed to create crypto invoice" }, { status: 500 });
        }

    } catch (error) {
        console.error("Crypto checkout error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
