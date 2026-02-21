import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const PRODUCTION_URL = 'https://nmleee-9qri.vercel.app';

// GET: Handle Google OAuth callback and save tokens
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // format: "userId|redirectUri"
    const error = searchParams.get('error');

    // Parse state to get userId and the exact redirectUri that was used
    const [userId, redirectUri] = state?.split('|') ?? [];
    const callbackRedirectUri = redirectUri || `${PRODUCTION_URL}/api/google/calendar/callback`;

    const dashboardUrl = `${PRODUCTION_URL}/dashboard/settings?tab=integrations`;

    if (error || !code || !userId) {
        return NextResponse.redirect(`${dashboardUrl}&error=calendar_denied`);
    }

    try {
        // Exchange authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: callbackRedirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            throw new Error(tokens.error_description || 'Failed to get tokens');
        }

        // Save tokens to user in database
        await prisma.user.update({
            where: { id: userId },
            data: {
                googleCalendarAccessToken: tokens.access_token,
                googleCalendarRefreshToken: tokens.refresh_token || undefined,
                googleCalendarTokenExpiry: tokens.expires_in
                    ? new Date(Date.now() + tokens.expires_in * 1000)
                    : undefined,
                googleCalendarConnected: true,
            },
        });

        return NextResponse.redirect(`${dashboardUrl}&success=calendar_connected`);
    } catch (error) {
        console.error('Google Calendar callback error:', error);
        return NextResponse.redirect(`${dashboardUrl}&error=calendar_failed`);
    }
}
