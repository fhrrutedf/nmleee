import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SAM_API_BASE = 'https://www.sam-api.pro/api/v1';
const SAM_API_KEY = process.env.SAM_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-sam-signature') || req.headers.get('signature');
    const { searchParams } = req.nextUrl;
    
    const userId = searchParams.get('userId');
    const planType = searchParams.get('planType');
    const isYearly = searchParams.get('isYearly') === 'true';
    const gateway = searchParams.get('gateway');
    const logId = searchParams.get('logId');

    if (!userId || !planType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const { event, invoiceId, status } = payload;

    // Verify webhook signature (if SAM API provides a secret, otherwise we skip or verify via endpoint)
    // For ultimate safety, let's verify via the /verify endpoint
    const verifyRes = await fetch(`${SAM_API_BASE}/pay/${invoiceId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${SAM_API_KEY}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.paid) {
      await supabaseAdmin.from('SamPaymentLog').insert({
        action: 'VERIFY_SUBSCRIPTION_FAILED',
        status: 'failed',
        sellerId: userId,
        requestPayload: { payload, logId },
        responsePayload: verifyData,
        samInvoiceId: invoiceId,
        errorMessage: 'Verification returned false',
      });
      return NextResponse.json({ error: 'Payment not verified' }, { status: 400 });
    }

    // Payment is verified! Update User plan
    const expiresAt = new Date();
    if (isYearly) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: planType as any,
        planExpiresAt: expiresAt,
      },
    });

    // Log success
    await supabaseAdmin.from('SamPaymentLog').insert({
      action: 'SUBSCRIPTION_ACTIVATED',
      status: 'paid',
      sellerId: userId,
      requestPayload: { payload, logId, planType, isYearly },
      responsePayload: verifyData,
      samInvoiceId: invoiceId,
      amount: verifyData.amount,
      currency: 'SYP',
    });

    // Add internal notification
    await prisma.notification.create({
      data: {
        type: 'INTERNAL',
        title: 'تم تفعيل الباقة بنجاح 🎉',
        content: `تم ترقية حسابك إلى باقة ${planType} عبر ${gateway === 'shamcash' ? 'شام كاش' : 'سيريتل كاش'} بنجاح!`,
        receiverEmail: (await prisma.user.findUnique({ where: { id: userId } }))?.email || '',
      }
    });

    return NextResponse.json({ received: true, status: 'activated' });

  } catch (error: any) {
    console.error('[SAM Subscription Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
