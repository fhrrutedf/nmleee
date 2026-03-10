import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { sendTelegramMessage, newOrderMessage } from '@/lib/telegram';
import { sendManualOrderApproved } from '@/lib/email';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // Check if admin
        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
        });

        if (admin?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const orderId = id;

        // Get order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
        }

        if (order.status !== 'PENDING') {
            return NextResponse.json({ error: 'الطلب تمت معالجته بالفعل' }, { status: 400 });
        }

        // Update order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'PAID',
                isPaid: true,
                paidAt: new Date(),
                verifiedBy: admin.id,
                verifiedAt: new Date(),
            },
        });

        // Update seller balance
        if (order.sellerId) {
            await prisma.user.update({
                where: { id: order.sellerId },
                data: {
                    pendingBalance: { increment: order.sellerAmount },
                    totalEarnings: { increment: order.sellerAmount },
                },
            });
        }

        // Auto-generate Invoice
        const seller = order.sellerId ? await prisma.user.findUnique({
            where: { id: order.sellerId },
            select: { name: true, username: true },
        }) : null;

        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const invoiceCount = await prisma.invoice.count();
        const invoiceNumber = `INV-${dateStr}-${String(invoiceCount + 1).padStart(3, '0')}`;

        await prisma.invoice.create({
            data: {
                invoiceNumber,
                orderId,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                customerCountry: order.paymentCountry,
                sellerName: seller?.name || null,
                sellerUsername: seller?.username || null,
                sellerId: order.sellerId,
                subtotal: order.totalAmount + order.discount,
                discount: order.discount,
                platformFee: order.platformFee,
                totalAmount: order.totalAmount,
                currency: 'USD',
                paymentMethod: order.paymentMethod,
                paymentProvider: order.paymentProvider,
                transactionRef: order.transactionRef,
                paymentProof: order.paymentProof,
                status: 'verified',
            },
        });

        // Send Telegram notification to admin
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
            include: { product: true, course: true },
        });
        const products = orderItems.map(i => i.product?.title || i.course?.title || 'منتج');

        await sendTelegramMessage(newOrderMessage({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            sellerName: seller?.name || 'غير محدد',
            amount: order.totalAmount,
            products,
        }));

        // Auto-enroll in courses (same as Stripe webhook)
        for (const item of orderItems) {
            if (item.course && order.customerEmail) {
                await prisma.courseEnrollment.upsert({
                    where: {
                        courseId_studentEmail: {
                            courseId: item.courseId!,
                            studentEmail: order.customerEmail,
                        },
                    },
                    update: { orderId },
                    create: {
                        courseId: item.courseId!,
                        studentName: order.customerName || 'العميل',
                        studentEmail: order.customerEmail,
                        orderId,
                    },
                });
            }

            // Handle bundles containing courses
            if (item.bundleId) {
                const bundle = await prisma.bundle.findUnique({
                    where: { id: item.bundleId },
                    include: { products: { include: { product: true } } },
                });
                if (bundle) {
                    for (const bp of bundle.products) {
                        if ((bp.product as any).type === 'course' || bp.product.id) {
                            // Check if this product is actually a course
                            const linkedCourse = await prisma.course.findFirst({
                                where: { id: bp.product.id },
                            });
                            if (linkedCourse) {
                                await prisma.courseEnrollment.upsert({
                                    where: {
                                        courseId_studentEmail: {
                                            courseId: linkedCourse.id,
                                            studentEmail: order.customerEmail,
                                        },
                                    },
                                    update: { orderId },
                                    create: {
                                        courseId: linkedCourse.id,
                                        studentName: order.customerName || 'العميل',
                                        studentEmail: order.customerEmail,
                                        orderId,
                                    },
                                });
                            }
                        }
                    }
                }
            }
        }

        // Send approval email to customer (with course link if applicable)
        const courseItem = orderItems.find(i => i.course);
        try {
            await sendManualOrderApproved({
                to: order.customerEmail,
                customerName: order.customerName || 'العميل',
                orderNumber: order.orderNumber,
                amount: order.totalAmount,
                courseId: courseItem?.courseId || undefined,
                courseTitle: courseItem?.course?.title || undefined,
            });
        } catch (emailErr) {
            console.error('Failed to send approval email:', emailErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error approving order:', error);
        return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
    }
}
