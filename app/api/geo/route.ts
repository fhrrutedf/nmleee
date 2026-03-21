import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";

/**
 * 🌍 GEOLOCATION FALLBACK SERVICE
 * 1. Checks for 'user_country' override cookie (manual selection).
 * 2. Fallbacks to Vercel's Edge Geo-IP header.
 * 3. Defaults to 'US' for local dev or if detection fails.
 */
export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const forcedCountry = cookieStore.get('user_country')?.value;
    
    // Priority: Forced Cookie > Vercel Header > Default
    const country = forcedCountry || req.headers.get('x-vercel-ip-country') || 'US';

    return NextResponse.json({ 
        country,
        source: forcedCountry ? 'manual_override' : 'edge_detection'
    });
}
