import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, source } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
        }

        // Check if subscriber already exists
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({ error: "أنت مشترك بالفعل!" }, { status: 400 });
        }

        // Create new subscriber
        const subscriber = await prisma.newsletterSubscriber.create({
            data: {
                email,
                source: source || "website"
            }
        });

        return NextResponse.json({ success: true, subscriber });
    } catch (error: any) {
        return NextResponse.json({ error: "حدث خطأ أثناء الاشتراك" }, { status: 500 });
    }
}
