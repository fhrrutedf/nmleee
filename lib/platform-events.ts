import { prisma } from './db';

export async function logPlatformEvent({
    eventType,
    severity = 'info',
    title,
    description,
    metadata,
    actorId,
    actorType = 'system',
    actorName,
    userId,
    orderId,
    productId,
    ipAddress,
    userAgent,
}: {
    eventType: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    title: string;
    description?: string;
    metadata?: any;
    actorId?: string;
    actorType?: 'user' | 'system' | 'admin' | 'webhook';
    actorName?: string;
    userId?: string;
    orderId?: string;
    productId?: string;
    ipAddress?: string;
    userAgent?: string;
}) {
    try {
        await prisma.platformEvent.create({
            data: {
                eventType,
                severity,
                title,
                description,
                metadata,
                actorId,
                actorType,
                actorName,
                userId,
                orderId,
                productId,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to log platform event:', error);
    }
}

// Predefined event types for consistency
export const EventTypes = {
    // User events
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login',
    USER_VERIFIED: 'user_verified',
    USER_BLOCKED: 'user_blocked',
    USER_UNBLOCKED: 'user_unblocked',
    
    // Order events
    ORDER_CREATED: 'order_created',
    ORDER_PAID: 'order_paid',
    ORDER_COMPLETED: 'order_completed',
    ORDER_CANCELLED: 'order_cancelled',
    ORDER_REFUNDED: 'order_refunded',
    
    // Payout events
    PAYOUT_REQUESTED: 'payout_requested',
    PAYOUT_APPROVED: 'payout_approved',
    PAYOUT_REJECTED: 'payout_rejected',
    PAYOUT_PAID: 'payout_paid',
    
    // Product events
    PRODUCT_CREATED: 'product_created',
    PRODUCT_PUBLISHED: 'product_published',
    PRODUCT_UPDATED: 'product_updated',
    PRODUCT_DELETED: 'product_deleted',
    
    // Subscription events
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_RENEWED: 'subscription_renewed',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    SUBSCRIPTION_EXPIRED: 'subscription_expired',
    
    // Security events
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    HIGH_VALUE_TRANSACTION: 'high_value_transaction',
    MULTIPLE_FAILED_LOGINS: 'multiple_failed_logins',
    
    // System events
    DAILY_REPORT_GENERATED: 'daily_report_generated',
    WEEKLY_REPORT_GENERATED: 'weekly_report_generated',
    BACKUP_COMPLETED: 'backup_completed',
} as const;
