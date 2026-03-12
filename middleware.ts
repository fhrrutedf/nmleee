import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Basic Security Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    // Redirect logic for dashboard/admin (simplified)
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
        const token = request.cookies.get('next-auth.session-token') ||
                    request.cookies.get('__Secure-next-auth.session-token');

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/api/test-db',
        '/api/health',
        '/api/auth/register'
    ],
};
