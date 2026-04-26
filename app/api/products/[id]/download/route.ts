import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

/**
 * Extracts the Supabase storage bucket name and file path from a stored URL.
 * Handles both:
 *   - /storage/v1/object/public/<bucket>/<path>
 *   - /storage/v1/object/sign/<bucket>/<path>?token=...
 */
function extractStoragePath(fileUrl: string): { bucket: string; path: string } | null {
    try {
        const match = fileUrl.match(
            /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(\?|$)/
        );
        if (!match) return null;
        return {
            bucket: match[1],
            path: decodeURIComponent(match[2]),
        };
    } catch {
        return null;
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await params;
        const token = req.nextUrl.searchParams.get('token');

        let isAuthorized = false;

        // ── 1. Token Auth (Order ID sent in the confirmation email link) ──
        if (token) {
            const validOrder = await prisma.order.findFirst({
                where: {
                    id: token,
                    status: { in: ['PAID', 'COMPLETED'] },
                    items: { some: { productId } },
                },
            });
            if (validOrder) isAuthorized = true;
        }

        // ── 2. Session Auth ───────────────────────────────────────────────
        if (!isAuthorized) {
            const session = await getServerSession(authOptions);
            if (session?.user?.email) {
                // Check if this user has a paid order containing this product
                const orderItem = await prisma.orderItem.findFirst({
                    where: {
                        productId,
                        order: {
                            customerEmail: {
                                equals: session.user.email,
                                mode: 'insensitive',
                            },
                            status: { in: ['PAID', 'COMPLETED'] },
                        },
                    },
                });

                // Also allow the seller/owner to download their own product
                const isSeller = await prisma.product.findFirst({
                    where: {
                        id: productId,
                        user: { email: session.user.email },
                    },
                });

                if (orderItem || isSeller) isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return new NextResponse('Unauthorized or Not purchased', { status: 403 });
        }

        // ── 3. Fetch product ─────────────────────────────────────────────
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { fileUrl: true, title: true },
        });

        if (!product?.fileUrl) {
            return new NextResponse('File not found', { status: 404 });
        }

        // ── 4. Generate a fresh Signed URL from Supabase Storage ─────────
        const parsed = extractStoragePath(product.fileUrl);

        if (parsed) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // 60 seconds is enough — user is redirected immediately
            const { data: signedData, error: signError } = await supabase.storage
                .from(parsed.bucket)
                .createSignedUrl(parsed.path, 60);

            if (signError || !signedData?.signedUrl) {
                console.error('[Download] Failed to create signed URL:', signError);
                return new NextResponse('فشل في إنشاء رابط التنزيل', { status: 500 });
            }

            // Redirect the browser directly to Supabase Storage
            // (avoids streaming large files through Vercel — fixes timeouts)
            return NextResponse.redirect(signedData.signedUrl);
        }

        // ── 5. Fallback: public or external URL (old products) ────────────
        if (product.fileUrl.startsWith('http')) {
            return NextResponse.redirect(product.fileUrl);
        }

        return new NextResponse('Invalid file URL configuration', { status: 500 });

    } catch (error) {
        console.error('[Download] Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
