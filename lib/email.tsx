import nodemailer from 'nodemailer';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import PayoutApprovedEmail from '@/emails/PayoutApproved';
import ManualOrderAlertEmail from '@/emails/ManualOrderAlert';
import { renderToStaticMarkup } from 'react-dom/server';

// Email sender address
const FROM_EMAIL = process.env.GMAIL_USER || process.env.EMAIL_FROM || 'noreply@tmleen.com';

function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
}

async function sendMail({ from, to, subject, html, react }: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    react?: React.ReactElement;
}) {
    const transporter = createTransporter();
    const htmlContent = react ? renderToStaticMarkup(react) : html || '';
    return transporter.sendMail({ from, to, subject, html: htmlContent });
}

// Order Confirmation
export async function sendOrderConfirmation(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ title: string; price: number }>;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `تأكيد الطلب ${data.orderNumber}`,
            react: OrderConfirmationEmail(data) as React.ReactElement,
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
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `✅ تمت الموافقة على السحب ${data.payoutNumber}`,
            react: PayoutApprovedEmail(data) as React.ReactElement,
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
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `❌ تم رفض السحب ${data.payoutNumber}`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl' }}>
                    <h1>مرحباً {data.sellerName}!</h1>
                    <p>للأسف، تم رفض طلب السحب رقم: {data.payoutNumber}</p>
                    <p><strong>المبلغ: </strong> ${data.amount.toFixed(2)}</p>
                    <p><strong>السبب: </strong> {data.reason}</p>
                    <p>تم إرجاع المبلغ إلى رصيدك المتاح.</p>
                    <a href="https://tmleen.com/dashboard/earnings" style={{
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
        await sendMail({
            from: FROM_EMAIL,
            to: data.adminEmail,
            subject: `🔔 طلب يدوي جديد: ${data.orderNumber}`,
            react: ManualOrderAlertEmail(data) as React.ReactElement,
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
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `✅ تمت الموافقة على طلبك ${data.orderNumber}`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl' }}>
                    <h1>مرحباً {data.customerName}! 🎉</h1>
                    <p>تمت الموافقة على طلبك بنجاح!</p>
                    <p><strong>رقم الطلب: </strong> {data.orderNumber}</p>
                    <p><strong>المبلغ: </strong> ${data.amount.toFixed(2)}</p>
                    <p>يمكنك الآن الوصول إلى مشترياتك.</p>
                    <a href="https://tmleen.com/orders" style={{
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
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `❌ تم رفض طلبك ${data.orderNumber}`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl' }}>
                    <h1>مرحباً {data.customerName}</h1>
                    <p>للأسف، تم رفض طلبك.</p>
                    <p><strong>رقم الطلب: </strong> {data.orderNumber}</p>
                    <p><strong>السبب: </strong> {data.reason}</p>
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

// Subscription Confirmation
export async function sendSubscriptionConfirmation(data: {
    to: string;
    customerName: string;
    planName: string;
    amount: number;
    billingCycle: string;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `✅ تم تفعيل اشتراكك في باقة ${data.planName}`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl', lineHeight: '1.6' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
                        <h1 style={{ color: '#0f172a', marginBottom: '20px', textAlign: 'center' }}>مرحباً {data.customerName}! 🎉</h1>
                        <p style={{ color: '#475569', fontSize: '16px' }}>شكراً لانضمامك إلينا. لقد تم تفعيل اشتراكك بنجاح وتقدر الآن تستفيد من جميع مميزات الباقة.</p>

                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>تفاصيل الاشتراك:</h3>
                            <p style={{ margin: '5px 0' }}><strong>الباقة:</strong> {data.planName}</p>
                            <p style={{ margin: '5px 0' }}><strong>المبلغ:</strong> ${data.amount.toFixed(2)}</p>
                            <p style={{ margin: '5px 0' }}><strong>دورة الدفع:</strong> {data.billingCycle === 'month' ? 'شهري' : 'سنوي'}</p>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a href="https://tmleen.com/dashboard/billing" style={{
                                backgroundColor: '#0ea5e9',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                display: 'inline-block',
                                fontWeight: 'bold'
                            }}>
                                إدارة اشتراكي
                            </a>
                        </div>
                    </div>
                </div>
            ),
        });
        console.log('✅ Subscription confirmation sent to', data.to);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}

// Welcome Email
export async function sendWelcomeEmail(
    userId: string,
    email: string,
    name: string,
    username: string
) {
    try {
        await sendMail({
            from: FROM_EMAIL,
            to: email,
            subject: `مرحباً بك في منصتنا يا ${name}! 🎉`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl', lineHeight: '1.6' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
                        <h1 style={{ color: '#0f172a', marginBottom: '20px', textAlign: 'center' }}>مرحباً {name}! 🚀</h1>
                        <p style={{ color: '#475569', fontSize: '16px' }}>يسعدنا انضمامك إلينا كصانع محتوى. نحن هنا لندعمك في رحلتك لتحويل شغفك إلى دخل مستدام.</p>

                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>معلومات حسابك:</h3>
                            <p style={{ margin: '5px 0' }}><strong>الاسم:</strong> {name}</p>
                            <p style={{ margin: '5px 0' }}><strong>رابط متجرك:</strong> <a href={`https://tmleen.com/${username}`}>tmleen.com/{username}</a></p>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a href="https://tmleen.com/dashboard" style={{
                                backgroundColor: '#D41295',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                display: 'inline-block',
                                fontWeight: 'bold'
                            }}>
                                الذهاب للوحة التحكم
                            </a>
                        </div>
                    </div>
                </div>
            ),
        });
        console.log('✅ Welcome email sent to', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}
