import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export interface LogEntry {
    actorId?: string;
    actorName?: string;
    actorRole?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(req: NextRequest | Request): string {
    const forwarded = (req as any).headers?.get?.('x-forwarded-for') || (req as any).headers?.['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0];
    return '127.0.0.1';
}

/**
 * Log an activity to the activity_logs table
 * Fire-and-forget (never throws)
 */
export async function logActivity(entry: LogEntry): Promise<void> {
    try {
        await prisma.$executeRaw`
            INSERT INTO activity_logs (actor_id, actor_name, actor_role, action, entity_type, entity_id, details, ip_address)
            VALUES (
                ${entry.actorId ?? null},
                ${entry.actorName ?? 'System'},
                ${entry.actorRole ?? 'SYSTEM'},
                ${entry.action},
                ${entry.entityType ?? null},
                ${entry.entityId ?? null},
                ${JSON.stringify(entry.details ?? {})}::jsonb,
                ${entry.ipAddress ?? null}
            )
        `;
    } catch (e) {
        // Never break the main flow
        console.error('[ActivityLog] Failed to log:', e);
    }
}

/**
 * Get recent activity logs
 */
export async function getActivityLogs(limit = 50, offset = 0, actorId?: string) {
    if (actorId) {
        return prisma.$queryRaw<any[]>`
            SELECT * FROM activity_logs
            WHERE actor_id = ${actorId}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;
    }
    return prisma.$queryRaw<any[]>`
        SELECT * FROM activity_logs
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
    `;
}

// ─── Action Constants ───────────────────────────────────────
export const LOG_ACTIONS = {
    // User
    USER_BANNED: 'user.banned',
    USER_ACTIVATED: 'user.activated',
    USER_ROLE_CHANGED: 'user.role_changed',
    USER_COMMISSION_CHANGED: 'user.commission_changed',

    // Orders
    ORDER_APPROVED: 'order.approved',
    ORDER_REJECTED: 'order.rejected',
    ORDER_REFUNDED: 'order.refunded',

    // Payouts
    PAYOUT_APPROVED: 'payout.approved',
    PAYOUT_REJECTED: 'payout.rejected',

    // Courses
    COURSE_APPROVED: 'course.approved',
    COURSE_REJECTED: 'course.rejected',
    COURSE_PUBLISHED: 'course.published',

    // Platform
    SETTINGS_UPDATED: 'platform.settings_updated',
    BROADCAST_SENT: 'broadcast.sent',
    PAYMENT_FAILED: 'platform.payment_failed',

    // Admin
    IMPERSONATION_STARTED: 'admin.impersonation_started',
    IMPERSONATION_ENDED: 'admin.impersonation_ended',
} as const;
