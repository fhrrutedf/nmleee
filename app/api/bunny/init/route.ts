import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { createBunnyVideo } from '@/lib/bunny';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const title = body.title || 'Draft Video Upload';

        // 1. Create a placeholder video in Bunny Stream
        const bunnyResponse = await createBunnyVideo(`Temp: ${title}`);
        const bunnyVideoId = bunnyResponse.guid;
        const libraryId = process.env.BUNNY_LIBRARY_ID || '';

        return NextResponse.json({
            videoId: bunnyVideoId,
            libraryId: libraryId,
            apiKey: process.env.BUNNY_API_KEY // Needed for XHR direct upload
        });

    } catch (error) {
        console.error('Bunny Init Error:', error);
        return NextResponse.json({ error: 'Failed to init upload' }, { status: 500 });
    }
}
