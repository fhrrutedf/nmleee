import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const settings = await prisma.automationSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id }
    });

    return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const data = await req.json();

    const settings = await prisma.automationSettings.update({
        where: { userId: user.id },
        data: {
            // Mapping fields safely
            welcomeEmailEnabled: data.welcomeEmailEnabled,
            welcomeEmailSubject: data.welcomeEmailSubject,
            welcomeEmailBody: data.welcomeEmailBody,
            cartReminder1Enabled: data.cartReminder1Enabled,
            cartReminder2Enabled: data.cartReminder2Enabled,
            cartReminder3Enabled: data.cartReminder3Enabled,
            cartReminder3Discount: data.cartReminder3Discount ? parseFloat(data.cartReminder3Discount) : null,
            cartReminder1Body: data.cartReminder1Body,
            cartReminder2Body: data.cartReminder2Body,
            cartReminder3Body: data.cartReminder3Body,
            notifyOnSale: data.notifyOnSale,
            notifyMethods: data.notifyMethods,
            marketingEnabled: data.marketingEnabled,
            inactiveUserDays: data.inactiveUserDays ? parseInt(data.inactiveUserDays) : 30,
            inactiveUserDiscount: data.inactiveUserDiscount ? parseFloat(data.inactiveUserDiscount) : null,
            inactiveUserMessage: data.inactiveUserMessage,
        }
    });

    return NextResponse.json(settings);
}
