import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/db';

// ═══ Supabase Admin Client (bypasses RLS) ═══
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SAM_API_BASE = 'https://www.sam-api.pro/api/v1';
const SAM_API_KEY = process.env.SAM_API_KEY || '';

// ═══ Helper: Log to SamPaymentLog table ═══
async function logSamAction(data: {
  orderId: string;
  sellerId?: string | null;
  samInvoiceId?: string | null;
  action: string;
  status: string;
  amount?: number;
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
      currency: 'SYP',
      requestPayload: data.requestPayload,
      responsePayload: data.responsePayload,
      errorMessage: data.errorMessage,
      ipAddress: data.ipAddress,
    });
  } catch (e) {
    console.error('[SAM LOG ERROR]', e);
  }
}

// ═══ POST /api/webhooks/sam-cash  ═══
// Called by SAM API after payment, also called manually to verify
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const orderId = req.nextUrl.searchParams.get('orderId');
    const gateway = req.nextUrl.searchParams.get('gateway') || 'syriatel_cash'; // 'syriatel_cash' | 'shamcash'
    const isShamCash = gateway === 'shamcash';
    const gatewayLabel = isShamCash ? 'شام كاش' : 'سيريتل كاش';
    const providerKey  = isShamCash ? 'shamcash' : 'syriatel_cash';

    if (!orderId) {
      return NextResponse.json({ error: 'orderId مطلوب' }, { status: 400 });
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        seller: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      return NextResponse.json({ message: 'الطلب مكتمل بالفعل', orderId });
    }

    const samInvoiceId = (order as any).samInvoiceId;
    if (!samInvoiceId) {
      return NextResponse.json({ error: 'لا يوجد رقم فاتورة SAM مرتبط بهذا الطلب' }, { status: 400 });
    }

    // ── Call SAM Verify API ──
    await logSamAction({
      orderId,
      sellerId: order.sellerId,
      samInvoiceId,
      action: 'VERIFY_PAYMENT',
      status: 'pending',
      requestPayload: { invoiceId: samInvoiceId },
      ipAddress: ip,
    });

    let verifyData: any;
    try {
      const verifyRes = await fetch(`${SAM_API_BASE}/pay/${samInvoiceId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SAM_API_KEY}`,
        },
      });
      verifyData = await verifyRes.json();
    } catch (fetchErr: any) {
      await logSamAction({
        orderId,
        sellerId: order.sellerId,
        samInvoiceId,
        action: 'VERIFY_PAYMENT',
        status: 'failed',
        errorMessage: fetchErr?.message,
        ipAddress: ip,
      });
      return NextResponse.json({ error: 'فشل الاتصال بـ SAM API للتحقق' }, { status: 503 });
    }

    const paymentStatus: string = verifyData?.status || 'unknown';
    const isPaid = paymentStatus === 'paid' || paymentStatus === 'completed' || paymentStatus === 'success';

    // Log the verify response
    await logSamAction({
      orderId,
      sellerId: order.sellerId,
      samInvoiceId,
      action: 'VERIFY_PAYMENT',
      status: isPaid ? 'paid' : paymentStatus,
      responsePayload: verifyData,
      ipAddress: ip,
    });

    if (isPaid) {
      // ── Update Order to PAID ──
      const now = new Date();
      await supabaseAdmin
        .from('Order')
        .update({
          status: 'PAID',
          isPaid: true,
          paidAt: now.toISOString(),
          samPaymentStatus: 'paid',
          samVerifiedAt: now.toISOString(),
          samApiResponse: verifyData,
          transactionRef: samInvoiceId,
          paymentProvider: providerKey,
        })
        .eq('id', orderId);

      // ── Activate Products / Enrollments ──
      for (const item of order.items) {
        if (item.itemType === 'course' && item.courseId) {
          // Enroll student in course
          const existingEnrollment = await prisma.courseEnrollment.findFirst({
            where: {
              courseId: item.courseId,
              studentEmail: order.customerEmail,
            },
          });
          if (!existingEnrollment) {
            await supabaseAdmin.from('CourseEnrollment').insert({
              courseId: item.courseId,
              studentName: order.customerName,
              studentEmail: order.customerEmail,
              orderId: order.id,
              progress: 0,
              isCompleted: false,
            });
          }
        }
        // Products don't need enrollment — access granted by checking orders
      }

      // ── Handle Platform Plan Subscription ──
      const subscriptionItem = order.items.find(i => i.itemType === 'subscription');
      if (subscriptionItem && order.userId) {
        // Determine which plan based on price
        let planType: 'GROWTH' | 'PRO' | 'FREE' = 'GROWTH';
        if (order.totalAmount >= 40) planType = 'PRO';

        const planExpiry = new Date();
        planExpiry.setMonth(planExpiry.getMonth() + 1); // 1 month subscription

        await supabaseAdmin
          .from('User')
          .update({
            planType,
            planExpiresAt: planExpiry.toISOString(),
          })
          .eq('id', order.userId);
      }

      // ── Send Notification to Seller ──
      if (order.sellerId) {
        await supabaseAdmin.from('Notification').insert({
          type: 'NEW_SALE',
          title: `دفعة جديدة عبر ${gatewayLabel} 💳`,
          content: `تم استلام دفعة $${order.totalAmount.toFixed(2)} من ${order.customerName} — رقم الفاتورة: ${samInvoiceId}`,
          receiverId: order.sellerId,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'تم التحقق من الدفع وتفعيل الطلب بنجاح',
        orderId,
        samInvoiceId,
        status: 'paid',
      });

    } else {
      // Payment not completed yet
      await supabaseAdmin
        .from('Order')
        .update({
          samPaymentStatus: paymentStatus,
          samApiResponse: verifyData,
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: false,
        message: 'لم يتم إتمام الدفع بعد',
        status: paymentStatus,
        orderId,
        samInvoiceId,
      });
    }

  } catch (error: any) {
    console.error('[SAM Webhook Error]:', error);
    return NextResponse.json({ error: 'خطأ داخلي في التحقق من الدفع' }, { status: 500 });
  }
}

// ═══ GET: Manual re-verify (for seller/admin to re-check) ═══
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: 'orderId مطلوب' }, { status: 400 });

    // Reuse POST logic
    const syntheticReq = new NextRequest(req.url, { method: 'POST' });
    return POST(syntheticReq);
  } catch (err) {
    return NextResponse.json({ error: 'فشل التحقق' }, { status: 500 });
  }
}
