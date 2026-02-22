import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const sellerId = session.user.id;

        // Fetch all affiliate links for products owned by this seller
        const affiliateLinks = await prisma.affiliateLink.findMany({
            where: {
                OR: [
                    { product: { userId: sellerId } },
                    { course: { userId: sellerId } } // In case they have courses too
                ]
            },
            include: {
                product: { select: { title: true, price: true } },
                user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        // Also fetch all seller's products to populate the dropdown for new links
        const products = await prisma.product.findMany({
            where: { userId: sellerId },
            select: { id: true, title: true, price: true }
        });

        return NextResponse.json({ affiliateLinks, products });
    } catch (error) {
        console.error('Error fetching affiliate links:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب بيانات التسويق بالعمولة' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await req.json();
        const { email, productId, commissionType, commissionValue } = body;

        if (!email || !productId || !commissionType || !commissionValue) {
            return NextResponse.json({ error: 'البيانات الأساسية مطلوبة (البريد، المنتج، قيمة ونوع العمولة)' }, { status: 400 });
        }

        // Check if the user exists
        const affiliateUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!affiliateUser) {
            return NextResponse.json({ error: 'لا يوجد مستخدم مسجل بهذا البريد الإلكتروني على المنصة' }, { status: 404 });
        }

        // Check if the seller owns the product
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product || product.userId !== session.user.id) {
            return NextResponse.json({ error: 'المنتج غير موجود أو غير مملوك لك' }, { status: 404 });
        }

        // Generate a random affiliate code (e.g., AF-1234ABCD)
        const code = "AF-" + crypto.randomBytes(4).toString("hex").toUpperCase();

        const affiliateLink = await prisma.affiliateLink.create({
            data: {
                code,
                productId,
                commissionType,
                commissionValue: parseFloat(commissionValue),
                userId: affiliateUser.id,
            }
        });

        return NextResponse.json(affiliateLink, { status: 201 });
    } catch (error) {
        console.error('Error creating affiliate link:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء رابط التسويق' }, { status: 500 });
    }
}
