import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch fresh rates from a public API
        // Note: For SYP (Syrian Pound), we will NOT update it from a global API because 
        // official rates (13,000) differ from real platform needs often.
        // We will update EGP, IQD, and AED which are more stable global currencies.
        
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();

        if (!data || !data.rates) {
            throw new Error('Failed to fetch rates from external provider.');
        }

        const rates = data.rates;
        
        // Update database (Keep SYP as-is or manually managed)
        const updatedSettings = await prisma.platformSettings.update({
            where: { id: 'singleton' },
            data: {
                usdToIqd: rates.IQD ? Math.round(rates.IQD) : undefined,
                usdToEgp: rates.EGP ? parseFloat(rates.EGP.toFixed(2)) : undefined,
                usdToAed: rates.AED ? parseFloat(rates.AED.toFixed(2)) : undefined,
            }
        });

        return NextResponse.json({
            success: true,
            updatedRates: {
                IQD: updatedSettings.usdToIqd,
                EGP: updatedSettings.usdToEgp,
                AED: updatedSettings.usdToAed,
                SYP: updatedSettings.usdToSyp, // Returned but not changed from API
                note: "SYP rate remains manually managed for market precision."
            }
        });

    } catch (error) {
        console.error('Rate sync failure:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
