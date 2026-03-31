import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const eventType = searchParams.get('eventType');
        const severity = searchParams.get('severity');
        const limit = parseInt(searchParams.get('limit') || '50');
        const since = searchParams.get('since');

        const where: any = {};
        if (eventType) where.eventType = eventType;
        if (severity) where.severity = severity;
        if (since) {
            where.createdAt = { gte: new Date(since) };
        }

        const events = await prisma.platformEvent.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            eventType,
            severity = 'info',
            title,
            description,
            metadata,
            actorId,
            actorType = 'system',
            actorName,
            userId,
            orderId,
            productId,
            ipAddress,
            userAgent,
        } = body;

        const event = await prisma.platformEvent.create({
            data: {
                eventType,
                severity,
                title,
                description,
                metadata,
                actorId,
                actorType,
                actorName,
                userId,
                orderId,
                productId,
                ipAddress,
                userAgent,
            },
        });

        return NextResponse.json({ event, success: true });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
