import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Vercel automatically injects x-vercel-ip-country header
    const country = req.headers.get('x-vercel-ip-country') || 'DEFAULT';

    return NextResponse.json({ country });
}
