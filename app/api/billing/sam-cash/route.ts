import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { getActiveWalletIdentifier } from '@/lib/sam-api/wallet';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SAM_API_BASE = 'https://www.sam-api.pro/api/v1';
const SAM_API_KEY = process.env.SAM_API_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://noaof.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }

    const { planSlug, isYearly, gateway } = await req.json(); // gateway = 'syriatel_cash' | 'shamcash'

    if (!['starter', 'pro'].includes(planSlug)) {
      return NextResponse.json({ error: 'باقة غير صالحة' }, { status: 400 });
    }

    if (!['syriatel_cash', 'shamcash'].includes(gateway)) {
      return NextResponse.json({ error: 'بوابة الدفع غير مدعومة' }, { status: 400 });
    }

    if (!SAM_API_KEY) {
      return NextResponse.json({ error: 'بوابة الدفع معطلة' }, { status: 503 });
    }

    const planType = planSlug === 'starter' ? 'GROWTH' : 'PRO';
    const monthlyPrice = planSlug === 'starter' ? 19 : 49;
    const yearlyPrice = planSlug === 'starter' ? 182 : 470;
    const usdAmount = isYearly ? yearlyPrice : monthlyPrice;

    // Get exchange rate
    const platformSettings = await prisma.platformSettings.findFirst();
    const exchangeRate = platformSettings?.usdToSyp || 13000;
    
    const totalSYP = Math.round(usdAmount * exchangeRate);

    // Create a temporary unfulfilled record or log to keep track (optional, we can just use webhook params)
    const logId = `SUB-${userId}-${Date.now()}`;
    const webhookUrl = `${APP_URL}/api/webhooks/sam-cash/subscription?userId=${userId}&planType=${planType}&isYearly=${isYearly}&logId=${logId}&gateway=${gateway}`;

    const apiMethod = gateway === 'shamcash' ? 'shamcash' : 'syriatel';
    const apiIdentifier = await getActiveWalletIdentifier(apiMethod, SAM_API_KEY);

    if (!apiIdentifier) {
      return NextResponse.json({ error: 'لم يتم العثور على محفظة مفعلة لاستقبال الأموال.' }, { status: 500 });
    }

    const invoicePayload = {
      method: apiMethod,
      identifier: apiIdentifier,
      amount: totalSYP.toString(),
      currency: "SYP",
      webhookUrl: webhookUrl,
    };

    const samRes = await fetch(`${SAM_API_BASE}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SAM_API_KEY}`,
      },
      body: JSON.stringify(invoicePayload),
    });

    const samData = await samRes.json();

    if (!samRes.ok || !samData?.invoiceId) {
      console.error('[SAM API Subscription Error]', samData);
      return NextResponse.json({ error: 'فشل إنشاء فاتورة الدفع.' }, { status: 502 });
    }

    const samPaymentUrl = `https://www.sam-api.pro/pay/${samData.invoiceId}`;

    // Log the initiation
    await supabaseAdmin.from('SamPaymentLog').insert({
      action: 'CREATE_SUBSCRIPTION_INVOICE',
      status: 'pending',
      amount: totalSYP,
      currency: 'SYP',
      sellerId: userId,
      requestPayload: invoicePayload,
      responsePayload: samData,
      samInvoiceId: samData.invoiceId,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: samPaymentUrl,
    });

  } catch (error: any) {
    console.error('[Billing Checkout Error]:', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
