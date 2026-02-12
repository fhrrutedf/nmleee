import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'بريد إلكتروني غير صحيح' }, { status: 400 });
        }

        // Check if already subscribed
        const existing = await prisma.emailSubscriber.findUnique({
            where: { email },
        });

        if (existing) {
            return NextResponse.json({ error: 'مشترك بالفعل' }, { status: 400 });
        }

        // Create new subscriber
        const subscriber = await prisma.emailSubscriber.create({
            data: { email },
        });

        return NextResponse.json({ success: true, subscriber });
    } catch (error) {
        console.error('Error subscribing email:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const subscribers = await prisma.emailSubscriber.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
