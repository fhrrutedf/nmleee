import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ 
        status: 'OK', 
        message: 'Vercel is working fine!', 
        time: new Date().toISOString() 
    });
}
