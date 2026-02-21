import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
].join(' ');

// Fixed production URL - avoids NEXTAUTH_URL mismatch issues
const PRODUCTION_URL = 'https://nmleee-9qri.vercel.app';

// GET: Redirect user to Google for Calendar permission
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use request origin to get exact base URL (works locally and in production)
    const origin = request.headers.get('origin') ||
        request.headers.get('x-forwarded-host')
        ? `https://${request.headers.get('x-forwarded-host')}`
        : PRODUCTION_URL;

    const redirectUri = `${origin}/api/google/calendar/callback`;

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent',
        state: `${(session.user as any).id}|${redirectUri}`, // Pass user ID + redirect URI in state
    });

    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
    return NextResponse.redirect(authUrl);
}
