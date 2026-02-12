import { Novu } from '@novu/node';

// Initialize Novu only if API key is provided
const NOVU_API_KEY = process.env.NOVU_API_KEY;
const novu = NOVU_API_KEY ? new Novu(NOVU_API_KEY) : null;

// Check if Novu is enabled
const isNovuEnabled = () => {
    if (!novu) {
        console.warn('⚠️ Novu is not configured. Set NOVU_API_KEY in .env to enable notifications.');
        return false;
    }
    return true;
};

/**
 * Notification Events
 * هذه الأحداث يجب أن تُنشأ في لوحة تحكم Novu
 */
export const NotificationEvents = {
    // User events
    WELCOME: 'user-welcome',
    EMAIL_VERIFICATION: 'email-verification',

    // Order events
    ORDER_CREATED: 'order-created',
    ORDER_COMPLETED: 'order-completed',

    // Payment events
    PAYMENT_SUCCESS: 'payment-success',
    PAYMENT_FAILED: 'payment-failed',

    // Seller events
    NEW_ORDER_SELLER: 'new-order-seller',
    PAYOUT_REQUEST: 'payout-request',
    PAYOUT_COMPLETED: 'payout-completed',

    // Appointment events
    APPOINTMENT_BOOKED: 'appointment-booked',
    APPOINTMENT_REMINDER: 'appointment-reminder',
    APPOINTMENT_CANCELLED: 'appointment-cancelled',
} as const;

/**
 * تسجيل مستخدم جديد في Novu
 */
export async function registerSubscriber(
    userId: string,
    email: string,
    data?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatar?: string;
    }
) {
    if (!isNovuEnabled()) return;

    try {
        await novu!.subscribers.identify(userId, {
            email,
            firstName: data?.firstName,
            lastName: data?.lastName,
            phone: data?.phone,
            avatar: data?.avatar,
        });

        console.log(`✅ Novu: Subscriber registered - ${email}`);
    } catch (error) {
        console.error('❌ Novu: Error registering subscriber:', error);
        // Don't throw - fail silently
    }
}

/**
 * تحديث بيانات مشترك
 */
export async function updateSubscriber(
    userId: string,
    data: {
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatar?: string;
    }
) {
    if (!isNovuEnabled()) return;

    try {
        await novu!.subscribers.update(userId, data);
        console.log(`✅ Novu: Subscriber updated - ${userId}`);
    } catch (error) {
        console.error('❌ Novu: Error updating subscriber:', error);
    }
}

/**
 * إرسال إشعار
 */
export async function sendNotification(
    eventName: string,
    userId: string,
    payload: Record<string, any>
) {
    if (!isNovuEnabled()) return null;

    try {
        const result = await novu!.trigger(eventName, {
            to: {
                subscriberId: userId,
            },
            payload,
        });

        console.log(`✅ Novu: Notification sent - ${eventName} to ${userId}`);
        return result;
    } catch (error) {
        console.error(`❌ Novu: Error sending notification (${eventName}):`, error);
        // Don't throw - fail silently
        return null;
    }
}

/**
 * إرسال إشعار لعدة مستخدمين
 */
export async function sendBulkNotification(
    eventName: string,
    userIds: string[],
    payload: Record<string, any>
) {
    if (!isNovuEnabled()) return;

    try {
        const promises = userIds.map(userId =>
            novu!.trigger(eventName, {
                to: { subscriberId: userId },
                payload,
            })
        );

        await Promise.all(promises);
        console.log(`✅ Novu: Bulk notification sent - ${eventName} to ${userIds.length} users`);
    } catch (error) {
        console.error(`❌ Novu: Error sending bulk notification:`, error);
        // Don't throw - fail silently
    }
}

// ==================== Helper Functions ====================

/**
 * إرسال رسالة ترحيب للمستخدم الجديد
 */
export async function sendWelcomeEmail(
    userId: string,
    email: string,
    name: string,
    username: string
) {
    // تسجيل المستخدم أولاً
    await registerSubscriber(userId, email, { firstName: name });

    // إرسال الإشعار
    return sendNotification(NotificationEvents.WELCOME, userId, {
        name,
        username,
        platformUrl: `${process.env.NEXTAUTH_URL}/${username}`,
        dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    });
}

/**
 * إرسال تأكيد الطلب للعميل
 */
export async function sendOrderConfirmation(
    customerEmail: string,
    orderData: {
        orderNumber: string;
        customerName: string;
        productTitle: string;
        amount: number;
        downloadLink?: string;
    }
) {
    // تسجيل العميل كمشترك مؤقت
    const customerId = `customer-${orderData.orderNumber}`;
    await registerSubscriber(customerId, customerEmail, {
        firstName: orderData.customerName,
    });

    return sendNotification(NotificationEvents.ORDER_CREATED, customerId, orderData);
}

/**
 * إشعار البائع بطلب جديد
 */
export async function notifySellerNewOrder(
    sellerId: string,
    orderData: {
        orderNumber: string;
        customerName: string;
        productTitle: string;
        amount: number;
    }
) {
    return sendNotification(NotificationEvents.NEW_ORDER_SELLER, sellerId, orderData);
}

/**
 * إشعار نجاح الدفع
 */
export async function sendPaymentSuccess(
    userId: string,
    paymentData: {
        amount: number;
        orderNumber: string;
        productTitle: string;
        downloadLink?: string;
    }
) {
    return sendNotification(NotificationEvents.PAYMENT_SUCCESS, userId, paymentData);
}

/**
 * تذكير بموعد قادم
 */
export async function sendAppointmentReminder(
    userId: string,
    appointmentData: {
        title: string;
        date: string;
        time: string;
        meetingLink: string;
    }
) {
    return sendNotification(NotificationEvents.APPOINTMENT_REMINDER, userId, appointmentData);
}

/**
 * إشعار طلب سحب أرباح
 */
export async function notifyPayoutRequest(
    userId: string,
    payoutData: {
        amount: number;
        requestDate: string;
    }
) {
    return sendNotification(NotificationEvents.PAYOUT_REQUEST, userId, payoutData);
}

export default novu;
