import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 🕵️‍♂️ EMAIL TRACKING PIXEL
 * Tracks when a customer opens a marketing email by recording 'openedAt'.
 * Returns a 1x1 transparent GIF.
 */
export async function GET(req: NextRequest) {
    const logId = req.nextUrl.searchParams.get("logId");

    if (logId) {
        try {
            await prisma.emailLog.update({
                where: { id: logId },
                data: { openedAt: new Date() }
            });
            console.log(`[TRACKING]: Email open recorded for Log ID: ${logId}`);
        } catch (error) {
            console.error("[TRACKING ERROR]:", error);
        }
    }

    // Return a 1x1 transparent GIF
    const pixel = Buffer.from(
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        "base64"
    );

    return new NextResponse(pixel, {
        headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    });
}
