import { NextResponse } from 'next/server';
import { withAuth } from "next-auth/middleware";
import { NextRequestWithAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const response = NextResponse.next();

        // ── Security Headers (backup — معظمها في next.config.js) ────
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

        return response;
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/api/admin/:path*",
    ],
};
