import { Resend } from 'resend';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import PayoutApprovedEmail from '@/emails/PayoutApproved';
import ManualOrderAlertEmail from '@/emails/ManualOrderAlert';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender addresses
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// Order Confirmation
export async function sendOrderConfirmation(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ title: string; price: number }>;
}) {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.to,
            subject: `تأكيد الطلب ${data.orderNumber}`,
            react: OrderConfirmationEmail(data),
        });
        console.log('✅ Order confirmation sent to', data.to);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}

// Payout Approved
export async function sendPayoutApproved(data: {
    to: string;
    sellerName: string;
    amount: number;
    method: string;
    payoutNumber: string;
    transactionId?: string;
}) {
    try {
        await resend.emails.send({
            from: 'payouts@tmleen.com',
            to: data.to,
            subject: `✅ تمت الموافقة على السحب ${data.payoutNumber}`,
            react: PayoutApprovedEmail(data),
        });
        console.log('✅ Payout approval sent to', data.to);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}

// Payout Rejected
export async function sendPayoutRejected(data: {
    to: string;
    sellerName: string;
    amount: number;
    payoutNumber: string;
    reason: string;
}) {
    try {
        await resend.emails.send({
            from: 'payouts@tmleen.com',
            to: data.to,
            subject: `❌ تم رفض السحب ${data.payoutNumber}`,
            react: (
                <div style= {{ fontFamily: 'Arial', padding: '20px', direction: 'rtl' }}>
                    <h1>مرحباً { data.sellerName } !</h1>
                        < p > للأسف، تم رفض طلب السحب رقم: { data.payoutNumber } </p>
                            < p > <strong>المبلغ: </strong> ${data.amount.toFixed(2)}</p >
                                <p><strong>السبب: </strong> {data.reason}</p >
                                    <p>تم إرجاع المبلغ إلى رصيدك المتاح.</p>
                                        < a href = "https://tmleen.com/dashboard/earnings" style = {{
        backgroundColor: '#4f46e5',
            color: 'white',
                padding: '12px 24px',
                    borderRadius: '6px',
                        textDecoration: 'none',
                            display: 'inline-block'
    }
}>
    عرض الأرباح
        </a>
        </div>
      ),
    });
console.log('✅ Payout rejection sent to', data.to);
return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
}
}

// Manual Order Alert (للأدمن)
export async function sendManualOrderAlert(data: {
    adminEmail: string;
    adminName: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    paymentMethod: string;
    orderId: string;
}) {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: data.adminEmail,
            subject: `🔔 طلب يدوي جديد: ${data.orderNumber}`,
            react: ManualOrderAlertEmail(data),
        });
        console.log('✅ Manual order alert sent to admin');
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}

// Manual Order Approved (للعميل)
export async function sendManualOrderApproved(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    amount: number;
}) {
    try {
        await resend.emails.send({
            from: 'orders@tmleen.com',
            to: data.to,
            subject: `✅ تمت الموافقة على طلبك ${data.orderNumber}`,
            react: (
                <div style= {{ fontFamily: 'Arial', padding: '20px', direction: 'rtl' }}>
                    <h1>مرحباً { data.customerName } ! 🎉</h1>
                        < p > تمت الموافقة على طلبك بنجاح! </p>
                            < p > <strong>رقم الطلب: </strong> {data.orderNumber}</p >
                                <p><strong>المبلغ: </strong> ${data.amount.toFixed(2)}</p >
                                    <p>يمكنك الآن الوصول إلى مشترياتك.</p>
                                        < a href = "https://tmleen.com/orders" style = {{
        backgroundColor: '#10b981',
            color: 'white',
                padding: '12px 24px',
                    borderRadius: '6px',
                        textDecoration: 'none',
                            display: 'inline-block'
    }
}>
    عرض الطلبات
        </a>
        </div>
      ),
    });
console.log('✅ Manual order approval sent to', data.to);
return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
}
}

// Manual Order Rejected (للعميل)
export async function sendManualOrderRejected(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    reason: string;
}) {
    try {
        await resend.emails.send({
            from: 'orders@tmleen.com',
            to: data.to,
            subject: `❌ تم رفض طلبك ${data.orderNumber}`,
            react: (
                <div style= {{ fontFamily: 'Arial', padding: '20px', direction: 'rtl' }}>
                    <h1>مرحباً { data.customerName } </h1>
                        < p > للأسف، تم رفض طلبك.</p>
                            < p > <strong>رقم الطلب: </strong> {data.orderNumber}</p >
                                <p><strong>السبب: </strong> {data.reason}</p >
                                    <p>يرجى التواصل معنا إذا كان لديك أي استفسار.</p>
                                        </div>
      ),
});
console.log('✅ Manual order rejection sent to', data.to);
return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error };
}
}
