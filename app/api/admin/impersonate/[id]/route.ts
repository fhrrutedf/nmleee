import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/db';
import { logActivity, LOG_ACTIONS } from '@/lib/activity-log';
import { encode } from 'next-auth/jwt';

// POST /api/admin/impersonate/[id]
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);
    const adminUser = session?.user as any;

    if (adminUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // CTO Security Layer: Master Secret Check
    const { secretKey } = await req.json().catch(() => ({}));
    const masterSecret = process.env.ADMIN_MASTER_PASSWORD || 'TAMLEEN_SECURE_2024'; 
    
    if (secretKey !== masterSecret) {
        return NextResponse.json({ error: 'Invalid Master Security Key' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, username: true },
    });

    if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log impersonation
    const { getClientIp } = await import('@/lib/activity-log');
    const { sendTelegramAlert, AuditTemplates } = await import('@/lib/telegram');
    
    await logActivity({
        actorId: adminUser.id,
        actorName: adminUser.name,
        actorRole: 'ADMIN',
        action: LOG_ACTIONS.IMPERSONATION_STARTED,
        entityType: 'User',
        entityId: targetUser.id,
        details: { targetEmail: targetUser.email, adminEmail: adminUser.email },
        ipAddress: getClientIp(req),
    });

    // Send Telegram Alert
    await sendTelegramAlert(AuditTemplates.sensitiveAction(
        adminUser.name, 
        'بداية انتحال شخصية', 
        `الأدمن دخل بحساب: ${targetUser.email}`
    ));

    // Create impersonation session record
    await prisma.$executeRaw`
        INSERT INTO impersonation_sessions (admin_id, target_user_id)
        VALUES (${adminUser.id}, ${targetUser.id})
    `;

    // Create a JWT token for the target user
    const token = await encode({
        secret: process.env.NEXTAUTH_SECRET!,
        token: {
            id: targetUser.id,
            sub: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            username: targetUser.username,
            role: targetUser.role,
            isImpersonating: true,
            originalAdminId: adminUser.id,
            originalAdminName: adminUser.name,
        },
    });

    // Return the token - client will set it as a cookie
    return NextResponse.json({
        success: true,
        token,
        targetUser: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
        },
        message: `جاري الدخول كـ ${targetUser.name}`,
    });
}

// DELETE /api/admin/impersonate/[id] - end impersonation
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: userId } = await params;
    await prisma.$executeRaw`
        UPDATE impersonation_sessions 
        SET ended_at = NOW() 
        WHERE target_user_id = ${userId} AND ended_at IS NULL
    `;

    return NextResponse.json({ success: true });
}
