import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { ensurePlanCurrent } from '@/lib/commission';
import { createClient } from '@supabase/supabase-js';

// ═══ Supabase Admin Client (bypasses RLS) ═══
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SAM_API_BASE = 'https://www.sam-api.pro/api/v1';
const SAM_API_KEY = process.env.SAM_API_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://noaof.vercel.app';

// ═══ Helper: Log to SamPaymentLog table ═══
async function logSamAction(data: {
  orderId: string;
  sellerId?: string | null;
  samInvoiceId?: string | null;
  action: string;
  status: string;
  amount?: number;
  currency?: string;
  requestPayload?: any;
  responsePayload?: any;
  errorMessage?: string;
  ipAddress?: string;
}) {
  try {
    await supabaseAdmin.from('SamPaymentLog').insert({
      orderId: data.orderId,
      sellerId: data.sellerId,
      samInvoiceId: data.samInvoiceId,
      action: data.action,
      status: data.status,
      amount: data.amount,
      currency: data.currency || 'SYP',
      requestPayload: data.requestPayload,
      responsePayload: data.responsePayload,
      errorMessage: data.errorMessage,
      ipAddress: data.ipAddress,
    });
  } catch (e) {
    console.error('[SAM LOG ERROR]', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { items, customerInfo, couponCode, affiliateRef } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'لا توجد منتجات في السلة' }, { status: 400 });
    }

    if (!SAM_API_KEY) {
      return NextResponse.json({ error: 'بوابة سيريتل كاش غير مفعّلة. تواصل مع الإدارة.' }, { status: 503 });
    }

    // ── Auth & Seller Resolution ──
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id || '';
    let sellerId = '';

    const firstItem = items[0];
    if (firstItem.type === 'product') {
      const product = await prisma.product.findUnique({ where: { id: firstItem.id } });
      sellerId = product?.userId || '';
    } else if (firstItem.type === 'course') {
      const course = await prisma.course.findUnique({ where: { id: firstItem.id } });
      sellerId = course?.userId || '';
    }

    if (!userId) userId = sellerId;
    if (sellerId) await ensurePlanCurrent(sellerId);

    const finalSellerId = sellerId === '' ? null : sellerId;

    // ── Platform Settings ──
    const platformSettings = await prisma.platformSettings.findFirst() || {
      commissionRate: 10,
      freeEscrowDays: 14,
      usdToSyp: 13000,
      growthCommissionRate: 5,
      growthEscrowDays: 7,
      proCommissionRate: 2,
      proEscrowDays: 3,
    };

    const seller = finalSellerId
      ? await prisma.user.findUnique({ where: { id: finalSellerId } })
      : null;

    let commissionRate = platformSettings.commissionRate;
    let escrowDays = platformSettings.freeEscrowDays;

    if (seller) {
      if (seller.planType === 'GROWTH') {
        commissionRate = platformSettings.growthCommissionRate || 5;
        escrowDays = platformSettings.growthEscrowDays || 7;
      } else if (seller.planType === 'PRO') {
        commissionRate = platformSettings.proCommissionRate || 2;
        escrowDays = platformSettings.proEscrowDays || 3;
      }
    }

    // ── Calculate Totals ──
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price, 0);
    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive) {
        if (coupon.type === 'percentage') {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else if (coupon.type === 'fixed') {
          discount = coupon.value;
        }
        couponId = coupon.id;
      }
    }

    const totalUSD = subtotal - discount;
    const exchangeRate = (platformSettings as any).usdToSyp || 13000;
    const totalSYP = Math.round(totalUSD * exchangeRate);

    const platformFee = (totalUSD * commissionRate) / 100;
    const sellerAmount = totalUSD - platformFee;

    const availableAt = new Date();
    availableAt.setDate(availableAt.getDate() + (escrowDays || 7));

    // ── Affiliate ──
    const refCode = affiliateRef || req.cookies.get('ref_code')?.value;
    let affiliateLinkId = null;
    if (refCode) {
      const link = await prisma.affiliateLink.findUnique({ where: { code: refCode } });
      if (link && link.isActive) affiliateLinkId = link.id;
    }

    // ── 1. Create Platform Order (status: PENDING) ──
    const orderNumber = `SC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        sellerId: finalSellerId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || '',
        totalAmount: totalUSD,
        status: 'PENDING',
        paymentProvider: 'syriatel_cash',
        paymentMethod: 'automated_api',
        couponId,
        discount,
        platformFee,
        sellerAmount,
        lockedExchangeRate: exchangeRate,
        availableAt,
        affiliateLinkId,
        currency: 'USD',
        items: {
          create: items.map((item: any) => ({
            itemType: item.type,
            productId: item.type === 'product' ? item.id : null,
            courseId: item.type === 'course' ? item.id : null,
            price: item.price,
            quantity: 1,
          })),
        },
      },
    });

    // ── 2. Create SAM API Invoice ──
    const webhookUrl = `${APP_URL}/api/webhooks/sam-cash?orderId=${order.id}&gateway=syriatel_cash`;
    const invoicePayload = {
      method: "syriatel",
      identifier: process.env.SAM_SYRIATEL_IDENTIFIER || "0990000000",
      amount: totalSYP.toString(),
      currency: "SYP",
      webhookUrl: webhookUrl,
    };

    await logSamAction({
      orderId: order.id,
      sellerId: finalSellerId,
      action: 'CREATE_INVOICE',
      status: 'pending',
      amount: totalSYP,
      currency: 'SYP',
      requestPayload: invoicePayload,
      ipAddress: ip,
    });

    let samInvoiceId: string;
    let samPaymentUrl: string;

    try {
      const samRes = await fetch(`${SAM_API_BASE}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SAM_API_KEY}`,
        },
        body: JSON.stringify(invoicePayload),
      });

      const samData = await samRes.json();

      if (!samRes.ok || !samData?.id) {
        // Log failure
        await logSamAction({
          orderId: order.id,
          sellerId: finalSellerId,
          action: 'CREATE_INVOICE',
          status: 'failed',
          amount: totalSYP,
          responsePayload: samData,
          errorMessage: `SAM API Error: ${samRes.status} - ${JSON.stringify(samData)}`,
          ipAddress: ip,
        });
        // Update order with error
        await supabaseAdmin
          .from('Order')
          .update({ samPaymentStatus: 'failed', samErrorMessage: JSON.stringify(samData) })
          .eq('id', order.id);

        return NextResponse.json({ error: 'فشل إنشاء فاتورة الدفع. يرجى المحاولة مرة أخرى.' }, { status: 502 });
      }

      samInvoiceId = samData.id;
      samPaymentUrl = `https://www.sam-api.pro/pay/${samInvoiceId}`;

      // Log success + update order
      await logSamAction({
        orderId: order.id,
        sellerId: finalSellerId,
        samInvoiceId,
        action: 'CREATE_INVOICE',
        status: 'pending',
        amount: totalSYP,
        responsePayload: samData,
        ipAddress: ip,
      });

      await supabaseAdmin
        .from('Order')
        .update({ samInvoiceId, samPaymentStatus: 'pending' })
        .eq('id', order.id);

    } catch (fetchErr: any) {
      await logSamAction({
        orderId: order.id,
        sellerId: finalSellerId,
        action: 'CREATE_INVOICE',
        status: 'failed',
        amount: totalSYP,
        errorMessage: fetchErr?.message || 'Network error',
        ipAddress: ip,
      });
      await supabaseAdmin
        .from('Order')
        .update({ samPaymentStatus: 'failed', samErrorMessage: fetchErr?.message })
        .eq('id', order.id);

      return NextResponse.json({ error: 'تعذّر الاتصال ببوابة الدفع. يرجى المحاولة لاحقاً.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber,
      samInvoiceId,
      paymentUrl: samPaymentUrl,
      totalUSD,
      totalSYP,
      exchangeRate,
    });

  } catch (error: any) {
    console.error('[SyriatelCash Checkout Error]:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع في عملية الدفع' }, { status: 500 });
  }
}
