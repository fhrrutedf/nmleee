import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const id = (await params).id;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        const question = await prisma.comment.findUnique({
            where: { id },
            include: {
                course: { select: { title: true } },
                lesson: { select: { title: true, module: { select: { title: true } } } },
                replies: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!question) {
            return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 });
        }

        // Add a basic security check to verify ownership if needed.
        // For now, assuming logged in user has access

        return NextResponse.json({ question });
    } catch (error) {
        console.error('Q&A Fetch Error:', error);
        return NextResponse.json({ error: 'حدث خطأ في جلب السؤال' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const id = (await params).id;

        const updatedQuestion = await prisma.comment.update({
            where: { id },
            data: { isResolved: true }
        });

        return NextResponse.json({ success: true, question: updatedQuestion });
    } catch (error) {
        console.error('Q&A Resolve Error:', error);
        return NextResponse.json({ error: 'حدث خطأ في تحديث السؤال' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const parentId = (await params).id;
        const body = await req.json();

        if (!body.content?.trim()) {
            return NextResponse.json({ error: 'محتوى الرد مطلوب' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
        }

        // Verify the parent question exists and the user owns the course
        const parentQuestion = await prisma.comment.findUnique({
            where: { id: parentId },
            include: { course: true }
        });

        if (!parentQuestion) {
            return NextResponse.json({ error: 'السؤال الأصلي غير موجود' }, { status: 404 });
        }

        if (parentQuestion.course?.userId !== user.id) {
            return NextResponse.json({ error: 'لا تملك صلاحية الرد على هذا السؤال' }, { status: 403 });
        }

        const reply = await prisma.comment.create({
            data: {
                content: body.content,
                authorName: user.name || 'مدرب',
                authorEmail: user.email,
                isApproved: true,
                parentId: parentId,
                courseId: parentQuestion.courseId,
                lessonId: parentQuestion.lessonId
            }
        });

        return NextResponse.json({ success: true, reply });
    } catch (error) {
        console.error('Q&A Reply Error:', error);
        return NextResponse.json({ error: 'حدث خطأ في إضافة الرد' }, { status: 500 });
    }
}
