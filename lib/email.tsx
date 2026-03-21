import nodemailer from 'nodemailer';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import PayoutApprovedEmail from '@/emails/PayoutApproved';
import ManualOrderAlertEmail from '@/emails/ManualOrderAlert';
import { render } from '@react-email/components';

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@tmleen.com';

function createTransporter() {
    return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER || '',
            pass: process.env.BREVO_SMTP_KEY || '',
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
    const htmlContent = react ? await render(react) : html || '';
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
                    }}>
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
    proofUrl?: string;
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

// Manual Order Review - (للعميل: نحن نراجع طلبك)
export async function sendManualOrderReview(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    amount: number;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `⏳ نحن نراجع دفعتك للطلب ${data.orderNumber}`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl', lineHeight: '1.6' }}>
                    <div style={{ backgroundColor: '#fff7ed', padding: '30px', borderRadius: '12px', border: '1px solid #fed7aa', maxWidth: '600px', margin: '0 auto' }}>
                        <h1 style={{ color: '#9a3412', marginBottom: '20px', textAlign: 'center' }}>مرحباً {data.customerName}! 👋</h1>
                        <p style={{ color: '#4338ca', fontSize: '18px', fontWeight: 'bold' }}>لقد استلمنا بيانات الدفع الخاصة بك.</p>
                        <p style={{ color: '#475569', fontSize: '16px' }}>طلبك رقم <span style={{ fontWeight: 'bold' }}>{data.orderNumber}</span> قيد المراجعة الآن من قبل فريق الحسابات.</p>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #fed7aa' }}>
                            <p style={{ margin: '5px 0' }}><strong>المبلغ المرصود: </strong> ${data.amount.toFixed(2)}</p>
                            <p style={{ margin: '5px 0' }}><strong>الحالة: </strong> قيد التحقق اليدوي</p>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>سيتم إرسال إيميل آخر فور تفعيل الطلب (عادة ما يستغرق الأمر من 15 دقيقة إلى ساعتين خلال أوقات العمل).</p>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <a href="https://tmleen.com/my-purchases" style={{
                                backgroundColor: '#4338ca', color: 'white', padding: '14px 28px',
                                borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold'
                            }}>
                                📦 متابعة حالة الطلب
                            </a>
                        </div>
                    </div>
                </div>
            ) as React.ReactElement,
        });
        console.log('✅ Manual order review email sent to', data.to);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}

// Manual Order Approved (للعميل: تم القبول بنجاح)
export async function sendManualOrderApproved(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    amount: number;
    courseId?: string;
    courseTitle?: string;
}) {
    try {
        const hasCourse = data.courseId && data.courseTitle;
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `✅ تمت الموافقة على طلبك ${data.orderNumber}`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl', lineHeight: '1.6' }}>
                    <div style={{ backgroundColor: '#f0fdf4', padding: '30px', borderRadius: '12px', border: '1px solid #bbf7d0', maxWidth: '600px', margin: '0 auto' }}>
                        <h1 style={{ color: '#166534', marginBottom: '20px', textAlign: 'center' }}>مرحباً {data.customerName}! 🎉</h1>
                        <p style={{ color: '#166534', fontSize: '16px', fontWeight: 'bold' }}>خبر سعيد! تمت الموافقة على طلبك بنجاح وتم تفعيل المنتجات في حسابك.</p>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #bbf7d0' }}>
                            <p style={{ margin: '5px 0' }}><strong>رقم الطلب: </strong> {data.orderNumber}</p>
                            <p style={{ margin: '5px 0' }}><strong>المبلغ: </strong> ${data.amount.toFixed(2)}</p>
                            {hasCourse && (
                                <p style={{ margin: '5px 0' }}><strong>الدورة: </strong> {data.courseTitle}</p>
                            )}
                        </div>
                        {hasCourse ? (
                            <>
                                <p style={{ color: '#059669', fontWeight: 'bold', fontSize: '16px' }}>🎓 تم فتح الدورة! يمكنك الآن البدء بالتعلم.</p>
                                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <a href={`https://tmleen.com/learn/${data.courseId}`} style={{
                                        backgroundColor: '#059669', color: 'white', padding: '14px 28px',
                                        borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold', fontSize: '16px'
                                    }}>
                                        🎓 البدء بالدورة الآن
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <a href="https://tmleen.com/my-purchases" style={{
                                    backgroundColor: '#166534', color: 'white', padding: '14px 28px',
                                    borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold'
                                }}>
                                    📦 عرض مشترياتي
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ) as React.ReactElement,
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
                        <p style={{ color: '#475569', fontSize: '16px' }}>شكراً لانضمامك إلينا. لقد تم تفعيل اشتراكك بنجاح.</p>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>تفاصيل الاشتراك:</h3>
                            <p style={{ margin: '5px 0' }}><strong>الباقة:</strong> {data.planName}</p>
                            <p style={{ margin: '5px 0' }}><strong>المبلغ:</strong> ${data.amount.toFixed(2)}</p>
                            <p style={{ margin: '5px 0' }}><strong>دورة الدفع:</strong> {data.billingCycle === 'month' ? 'شهري' : 'سنوي'}</p>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a href="https://tmleen.com/dashboard/billing" style={{
                                backgroundColor: '#0ea5e9', color: 'white', padding: '14px 28px',
                                borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold'
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
                                backgroundColor: '#D41295', color: 'white', padding: '14px 28px',
                                borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold'
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

// Guest Welcome Email (Auto-registration)
export async function sendGuestWelcomeEmail(
    email: string,
    name: string,
    tempPassword: string
) {
    try {
        await sendMail({
            from: FROM_EMAIL,
            to: email,
            subject: `تفاصيل الدخول لدورتك التدريبية يا ${name} 🎓`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl', lineHeight: '1.6' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px', margin: '0 auto' }}>
                        <h1 style={{ color: '#0f172a', marginBottom: '20px', textAlign: 'center' }}>أهلاً بك {name}! 🎓</h1>
                        <p style={{ color: '#475569', fontSize: '16px' }}>شكراً لانضمامك إلينا! لقد قمنا بإنشاء حساب خاص بك لتتمكن من الوصول إلى الدورات التي قمت بالتسجيل فيها.</p>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>بيانات الدخول لحسابك:</h3>
                            <p style={{ margin: '5px 0' }}><strong>البريد الإلكتروني:</strong> {email}</p>
                            <p style={{ margin: '5px 0' }}><strong>كلمة المرور:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{tempPassword}</span></p>
                            <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#dc2626' }}>* ننصح بشدة بتغيير كلمة المرور من صفحة الإعدادات بعد تسجيل الدخول الأول.</p>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a href="https://tmleen.com/login" style={{
                                backgroundColor: '#4f46e5', color: 'white', padding: '14px 28px',
                                borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold'
                            }}>
                                تسجيل الدخول الآن
                            </a>
                        </div>
                    </div>
                </div>
            ),
        });
        console.log('✅ Guest welcome email sent to', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}

// UnderPaid Notification (للعميل)
export async function sendUnderPaidNotification(data: {
    to: string;
    customerName: string;
    orderNumber: string;
    paidAmount: number;
    totalAmount: number;
    remaining: number;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL,
            to: data.to,
            subject: `⚠️ تنبيه: دفعة ناقصة للطلب ${data.orderNumber}`,
            react: (
                <div style={{ fontFamily: 'Arial', padding: '20px', direction: 'rtl', lineHeight: '1.6' }}>
                    <div style={{ backgroundColor: '#fff7ed', padding: '30px', borderRadius: '12px', border: '1px solid #fdba74', maxWidth: '600px', margin: '0 auto' }}>
                        <h1 style={{ color: '#9a3412', marginBottom: '20px', textAlign: 'center' }}>مرحباً {data.customerName}! ⚠️</h1>
                        <p style={{ color: '#475569', fontSize: '16px' }}>لقد استلمنا دفعتك للطلب رقم {data.orderNumber}، ولكن المبلغ كان أقل من المطلوب.</p>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #fed7aa' }}>
                            <p style={{ margin: '5px 0' }}><strong>المبلغ المطلوب:</strong> {data.totalAmount.toFixed(2)} USDT</p>
                            <p style={{ margin: '5px 0' }}><strong>المبلغ المدفوع:</strong> {data.paidAmount.toFixed(2)} USDT</p>
                            <p style={{ margin: '5px 0', color: '#dc2626', fontWeight: 'bold' }}><strong>المبلغ المتبقي:</strong> {data.remaining.toFixed(2)} USDT</p>
                        </div>
                        <p style={{ color: '#475569' }}>يرجى إرسال المبلغ المتبقي لنفس عنوان المحفظة لتفعيل طلبك آلياً.</p>
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a href="https://tmleen.com/my-purchases" style={{
                                backgroundColor: '#ea580c', color: 'white', padding: '14px 28px',
                                borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold'
                            }}>
                                عرض تفاصيل الطلب
                            </a>
                        </div>
                    </div>
                </div>
            ) as React.ReactElement,
        });
        console.log('✅ Underpaid notification sent to', data.to);
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}
