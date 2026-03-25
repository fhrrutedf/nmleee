import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, customerInfo, couponCode, affiliateRef, discount = 0 } = body;
        const { email, name } = customerInfo || {};

        if (!items || items.length === 0 || !email) {
            return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
        }

        // 1. Calculate Total Server-Side (Security Check)
        let calculatedTotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
        calculatedTotal -= discount;

        if (calculatedTotal <= 0) {
            // Support lead magnets/free if needed, but here we expect a price
            return NextResponse.json({ error: "المبلغ غير صالح" }, { status: 400 });
        }

        // 2. Identify Seller
        let sellerId = '';
        const firstItem = items[0];
        if (firstItem.type === 'product') {
            const p = await prisma.product.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
            sellerId = p?.userId || '';
        } else if (firstItem.type === 'course') {
            const c = await prisma.course.findUnique({ where: { id: firstItem.id }, select: { userId: true } });
            sellerId = c?.userId || '';
        }

        if (!sellerId) {
            return NextResponse.json({ error: "لا يمكن تحديد البائع" }, { status: 400 });
        }

        // 3. Create Pending Order
        const orderNumber = "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();
        const newOrder = await prisma.order.create({
            data: {
                orderNumber,
                customerName: name || email.split('@')[0],
                customerEmail: email,
                totalAmount: calculatedTotal,
                status: "PENDING",
                paymentMethod: "CRYPTO_USDT",
                sellerId: sellerId,
                userId: sellerId, // For simplicity in this structure
            }
        });

        // 4. Save Items
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

        // 5. CoinRemitter Request
        const apiKey = process.env.COINREMITTER_API_KEY;
        const password = process.env.COINREMITTER_PASSWORD;
        if (!apiKey || !password) {
            return NextResponse.json({ error: "Crypto payments not configured" }, { status: 500 });
        }

        const notifyUrl = `${process.env.NEXTAUTH_URL}/api/coinremitter/webhook`;
        const baseUrl = "https://coinremitter.com/api/v3/USDTTRC20/create-invoice";

        const apiRes = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                password: password,
                amount: calculatedTotal,
                notify_url: notifyUrl,
                name: `Order ${orderNumber}`,
                currency: "USD",
                expire_time: "60",
                custom_data1: newOrder.id
            })
        });

        const data = await apiRes.json();

        if (data.flag === 1) {
            const inv = data.data;
            await prisma.order.update({
                where: { id: newOrder.id },
                data: {
                    cryptoInvoiceId: inv.invoice_id,
                    cryptoAmount: parseFloat(inv.total_amount[inv.coin]),
                    cryptoCoin: inv.coin,
                    walletAddress: inv.address,
                    cryptoStatus: "Pending",
                }
            });

            return NextResponse.json({ success: true, url: inv.url });
        } else {
            return NextResponse.json({ error: data.msg || "فشل إنشاء فاتورة كريبتو" }, { status: 500 });
        }
    } catch (err) {
        console.error("Crypto API error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
