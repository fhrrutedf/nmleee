import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting storage (في الإنتاج استخدم Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// معدل الطلبات المسموح بها
const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 100 // 100 طلب لكل 15 دقيقة
};

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // 1. Security Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // 2. CORS Headers
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 3. Rate Limiting للـ API routes (استثناء المصادقة)
    if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth')) {
        try {
            const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
            const now = Date.now();
            const rateLimit = rateLimitMap.get(ip);

            if (rateLimit) {
                if (now < rateLimit.resetTime) {
                    if (rateLimit.count >= RATE_LIMIT.maxRequests) {
                        return NextResponse.json(
                            { error: 'تم تجاوز عدد الطلبات المسموح به. حاول مرة أخرى بعد قليل.' },
                            { status: 429 }
                        );
                    }
                    rateLimit.count++;
                } else {
                    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
                }
            } else {
                rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
            }
        } catch (error) {
            console.error('Middleware rate limit error:', error);
            // Continue if rate limit fails
        }
    }

    // 4. حماية صفحات Dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/admin')) {

        // Check both development and production cookie names
        const token = request.cookies.get('next-auth.session-token') ||
            request.cookies.get('__Secure-next-auth.session-token');

        if (!token && !request.nextUrl.pathname.includes('/login')) {
            // إعادة توجيه للـ login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
