import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const sellerId = searchParams.get('sellerId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('SamPaymentLog')
      .select('*, Order(orderNumber, customerName, customerEmail, totalAmount, status, currency, paymentProvider)', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (sellerId) query = query.eq('sellerId', sellerId);
    if (from) query = query.gte('createdAt', from);
    if (to) query = query.lte('createdAt', to);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    console.error('[Admin SAM Logs Error]:', err);
    return NextResponse.json({ error: 'خطأ في جلب السجلات' }, { status: 500 });
  }
}
