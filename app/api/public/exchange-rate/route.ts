import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const settings = await prisma.platformSettings.findFirst({
      select: { usdToSyp: true, usdToSypManual: true, usdToSypCrypto: true }
    });
    
    return NextResponse.json({ 
      usdToSyp: settings?.usdToSyp || 13000,
      usdToSypManual: (settings as any)?.usdToSypManual || 13500,
      usdToSypCrypto: (settings as any)?.usdToSypCrypto || 14000,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ usdToSyp: 13000 }, { status: 500 });
  }
}
