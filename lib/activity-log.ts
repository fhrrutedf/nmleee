import { prisma } from '@/lib/db';

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

    // Admin
    IMPERSONATION_STARTED: 'admin.impersonation_started',
    IMPERSONATION_ENDED: 'admin.impersonation_ended',
} as const;
