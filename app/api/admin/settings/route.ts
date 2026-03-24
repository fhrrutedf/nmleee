import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let settings = await prisma.platformSettings.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!settings) {
            // Create default settings if not exists
            settings = await prisma.platformSettings.create({
                data: {
                    id: 'singleton',
                    commissionRate: 10,
                    escrowDays: 14,
                    minPayoutAmount: 50,
                    freeEscrowDays: 14,
                    growthEscrowDays: 7,
                    proEscrowDays: 3,
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const settings = await prisma.platformSettings.upsert({
            where: { id: 'singleton' },
            update: {
                ...body,
                updatedAt: new Date(),
            },
            create: {
                id: 'singleton',
                ...body,
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Settings Update Error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
