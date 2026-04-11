import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const urlParams = await params;
        const productId = urlParams.id;

        // Verify the user actually bought this product
        const orderItem = await prisma.orderItem.findFirst({
            where: {
                productId: productId,
                order: {
                    user: { email: session.user.email },
                    status: { in: ['PAID', 'COMPLETED'] }
                }
            }
        });

        // Also allow seller to download their own product
        const isSeller = await prisma.product.findFirst({
            where: {
                id: productId,
                user: { email: session.user.email }
            }
        });

        if (!orderItem && !isSeller) {
            return new NextResponse('Not purchased or order not completed', { status: 403 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product || !product.fileUrl) {
            return new NextResponse('File not found', { status: 404 });
        }

        // Direct download by fetching the file and piping it back
        const fileResponse = await fetch(product.fileUrl);
        if (!fileResponse.ok) {
            return new NextResponse('Failed to fetch file from storage', { status: 500 });
        }

        const headers = new Headers();
        const fallbackName = product.title.trim().replace(/[^a-zA-Z\u0600-\u06FF0-9_\-\.]/gi, '_').substring(0, 50);
        
        // Try getting extension from original fileUrl if any, otherwise default to zip
        const extMatch = product.fileUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
        const ext = extMatch ? extMatch[1] : 'zip';
        
        headers.set('Content-Disposition', `attachment; filename="${fallbackName}.${ext}"`);
        headers.set('Content-Type', fileResponse.headers.get('Content-Type') || 'application/octet-stream');

        return new NextResponse(fileResponse.body, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
