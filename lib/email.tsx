import { sendEmail } from './resend';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import PayoutApprovedEmail from '@/emails/PayoutApproved';
import ManualOrderAlertEmail from '@/emails/ManualOrderAlert';
import { emailConfig } from './email-config';

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'info@manasadigital.com';

// Reusable Layout for inline templates
export const EmailLayout = ({ children, headerTitle, headerEmoji }: { children: React.ReactNode, headerTitle?: string, headerEmoji?: string }) => (
    <div style={{ fontFamily: emailConfig.theme.fontFamily, padding: '40px 20px', direction: 'rtl', lineHeight: '1.6', backgroundColor: emailConfig.theme.background }}>
        <div style={{ backgroundColor: emailConfig.theme.surface, padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
                <img src={emailConfig.brand.logoUrl} alt={emailConfig.brand.name} style={{ width: '150px', marginBottom: '20px' }} onError={(e: any) => e.target.style.display = 'none'} />
                {headerTitle && <h1 style={{ color: emailConfig.theme.textMain, marginBottom: '25px', fontSize: '24px' }}>{headerTitle} {headerEmoji}</h1>}
            </div>
            <div style={{ color: emailConfig.theme.textMuted, fontSize: '16px', textAlign: 'right' }}>
                {children}
            </div>
            <hr style={{ border: 'none', borderTop: `1px solid ${emailConfig.theme.border}`, margin: '30px 0 20px' }} />
            <p style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center' }}>{emailConfig.brand.footer}</p>
        </div>
    </div>
);

export const PrimaryButton = ({ href, text }: { href: string; text: string }) => (
    <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href={href} style={{
            backgroundColor: emailConfig.theme.primary, color: 'white', padding: '16px 32px',
            borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold', fontSize: '16px'
        }}>
            {text}
        </a>
    </div>
);

export const InfoBox = ({ children, isWarning = false }: { children: React.ReactNode, isWarning?: boolean }) => (
    <div style={{ backgroundColor: isWarning ? '#fff7ed' : '#f8fafc', padding: '20px', borderRadius: '12px', margin: '20px 0', border: `1px solid ${isWarning ? '#fed7aa' : emailConfig.theme.border}`, textAlign: 'right' }}>
        {children}
    </div>
);

async function sendMail({ from, to, subject, html, react }: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    react?: React.ReactElement;
}) {
    const result = await sendEmail({
        from: from || FROM_EMAIL,
        to,
        subject,
        html,
        react,
    });

    if (!result.success) throw new Error(result.error);
    return result;
}

// Order Confirmation
export async function sendOrderConfirmation(data: {
    to: string; customerName: string; orderNumber: string; totalAmount: number; items: Array<{ title: string; price: number }>;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `تأكيد الطلب ${data.orderNumber}`, react: OrderConfirmationEmail(data) as React.ReactElement,
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
    to: string; sellerName: string; amount: number; method: string; payoutNumber: string; transactionId?: string;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `✅ تمت الموافقة على السحب ${data.payoutNumber}`, react: PayoutApprovedEmail(data) as React.ReactElement,
        });
        console.log('✅ Payout approval sent to', data.to);
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Payout Rejected
export async function sendPayoutRejected(data: {
    to: string; sellerName: string; amount: number; payoutNumber: string; reason: string;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `❌ تم رفض السحب ${data.payoutNumber}`,
            react: (
                <EmailLayout headerTitle={`مرحباً ${data.sellerName}`} headerEmoji="👋">
                    <p>للأسف، تم رفض طلب السحب الخاص بك.</p>
                    <InfoBox isWarning={true}>
                        <p style={{ margin: '8px 0' }}><strong>رقم السحب:</strong> {data.payoutNumber}</p>
                        <p style={{ margin: '8px 0' }}><strong>المبلغ:</strong> ${data.amount.toFixed(2)}</p>
                        <p style={{ margin: '8px 0', color: '#dc2626' }}><strong>السبب:</strong> {data.reason}</p>
                    </InfoBox>
                    <p>تم إرجاع المبلغ إلى رصيدك المتاح، نعتذر عن هذا الإزعاج.</p>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/dashboard/earnings`} text="عرض الأرباح" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Manual Order Alert (للأدمن)
export async function sendManualOrderAlert(data: {
    adminEmail: string; adminName: string; orderNumber: string; customerName: string; customerEmail: string; amount: number; paymentMethod: string; orderId: string; proofUrl?: string;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.adminEmail, subject: `🔔 طلب يدوي جديد: ${data.orderNumber}`, react: ManualOrderAlertEmail(data) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Manual Order Review - (للعميل)
export async function sendManualOrderReview(data: {
    to: string; customerName: string; orderNumber: string; amount: number;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `⏳ نحن نراجع دفعتك للطلب ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle={`لقد استلمنا بيانات الدفع الخاصة بك`} headerEmoji="⏳">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</p>
                    <p>طلبك رقم <span style={{ fontWeight: 'bold' }}>{data.orderNumber}</span> قيد المراجعة الآن من قبل فريق الحسابات.</p>
                    <InfoBox isWarning={true}>
                        <p style={{ margin: '8px 0' }}><strong>المبلغ المرصود:</strong> ${data.amount.toFixed(2)}</p>
                        <p style={{ margin: '8px 0' }}><strong>الحالة:</strong> قيد التحقق اليدوي</p>
                    </InfoBox>
                    <p>سيتم إرسال إيميل آخر فور تفعيل الطلب (عادة ما يستغرق الأمر من 15 دقيقة إلى ساعتين خلال أوقات العمل).</p>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/my-purchases`} text="📦 متابعة حالة الطلب" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Manual Order Approved (للعميل)
export async function sendManualOrderApproved(data: {
    to: string; customerName: string; orderNumber: string; amount: number; courseId?: string; courseTitle?: string; from?: string;
}) {
    try {
        const hasCourse = data.courseId && data.courseTitle;
        await sendMail({
            from: data.from || FROM_EMAIL, to: data.to, subject: `✅ تمت الموافقة على طلبك ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle="خبر سعيد! تمت الموافقة على طلبك" headerEmoji="🎉">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</p>
                    <p>لقد تمت مراجعة دفعتك بنجاح، وتم تفعيل المنتجات في حسابك.</p>
                    <InfoBox>
                        <p style={{ margin: '8px 0' }}><strong>رقم الطلب:</strong> {data.orderNumber}</p>
                        <p style={{ margin: '8px 0' }}><strong>المبلغ:</strong> ${data.amount.toFixed(2)}</p>
                        {hasCourse && <p style={{ margin: '8px 0' }}><strong>الدورة:</strong> {data.courseTitle}</p>}
                    </InfoBox>
                    {hasCourse ? (
                        <>
                            <p style={{ color: emailConfig.theme.primaryDark, fontWeight: 'bold' }}>🎓 تم فتح الدورة! يمكنك الآن البدء بالتعلم.</p>
                            <PrimaryButton href={`${emailConfig.brand.baseUrl}/learn/${data.courseId}`} text="🎓 البدء بالدورة الآن" />
                        </>
                    ) : (
                        <PrimaryButton href={`${emailConfig.brand.baseUrl}/my-purchases`} text="📦 عرض مشترياتي" />
                    )}
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Manual Order Rejected (للعميل)
export async function sendManualOrderRejected(data: {
    to: string; customerName: string; orderNumber: string; reason: string; from?: string;
}) {
    try {
        await sendMail({
            from: data.from || FROM_EMAIL, to: data.to, subject: `❌ تم رفض طلبك ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle="ملاحظة بخصوص طلبك" headerEmoji="⚠️">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</p>
                    <p>نعتذر لإبلاغك بأنه تم رفض طلبك بعد مراجعة بيانات الدفع.</p>
                    <InfoBox isWarning={true}>
                        <p style={{ margin: '8px 0' }}><strong>رقم الطلب:</strong> {data.orderNumber}</p>
                        <p style={{ margin: '8px 0', color: '#dc2626' }}><strong>السبب:</strong> {data.reason}</p>
                    </InfoBox>
                    <p>يرجى مراجعة السبب والتواصل مع فريق الدعم إذا كان لديك أي استفسار أو لترتيب تحويل جديد صحيح.</p>
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Subscription Confirmation
export async function sendSubscriptionConfirmation(data: {
    to: string; customerName: string; planName: string; amount: number; billingCycle: string;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `✅ تم تفعيل اشتراكك في باقة ${data.planName}`,
            react: (
                <EmailLayout headerTitle="تم تفعيل اشتراكك بنجاح!" headerEmoji="🚀">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</p>
                    <p>شكراً لثقتك بنا وانضمامك إلينا. نحن متحمسون جداً لدعم مسيرتك.</p>
                    <InfoBox>
                        <h3 style={{ margin: '0 0 15px 0', color: emailConfig.theme.textMain }}>تفاصيل الاشتراك:</h3>
                        <p style={{ margin: '8px 0' }}><strong>الباقة:</strong> {data.planName}</p>
                        <p style={{ margin: '8px 0' }}><strong>دورة الدفع:</strong> {data.billingCycle === 'month' ? 'شهري' : 'سنوي'}</p>
                        <p style={{ margin: '8px 0' }}><strong>المبلغ المدفوع:</strong> ${data.amount.toFixed(2)}</p>
                    </InfoBox>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/dashboard/billing`} text="إدارة اشتراكي" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Welcome Email
export async function sendWelcomeEmail(
    userId: string, email: string, name: string, username: string
) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: email, subject: `مرحباً بك في ${emailConfig.brand.name} يا ${name}! 🎉`,
            react: (
                <EmailLayout headerTitle="أهلاً بك معنا!" headerEmoji="🚀">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{name}</strong>،</p>
                    <p>يسعدنا انضمامك إلى <strong>{emailConfig.brand.name}</strong>. نحن هنا لندعمك في رحلتك لتحويل التحديات التقنية إلى نجاحات رقمية وتمكين وجودك الرقمي.</p>
                    <InfoBox>
                        <h3 style={{ margin: '0 0 15px 0', color: emailConfig.theme.textMain, fontSize: '16px' }}>معلومات حسابك:</h3>
                        <p style={{ margin: '8px 0' }}><strong>الاسم:</strong> {name}</p>
                        <p style={{ margin: '8px 0' }}><strong>رابط متجرك:</strong> <a href={`${emailConfig.brand.baseUrl}/${username}`} style={{ color: emailConfig.theme.primary, textDecoration: 'none' }}>{emailConfig.brand.baseUrl.replace('https://', '')}/{username}</a></p>
                    </InfoBox>
                    <p>في حال احتجت لأي مساعدة، فريق الدعم الفني لدينا دائماً في خدمتك!</p>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/dashboard`} text="الذهاب للوحة التحكم" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Reset Password Email
export async function sendResetPasswordEmail(data: {
    to: string; customerName: string; resetLink: string;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `إعادة تعيين كلمة المرور | ${emailConfig.brand.name}`,
            react: (
                <EmailLayout headerTitle="إعادة تعيين كلمة المرور" headerEmoji="🔐">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</p>
                    <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك على <strong>{emailConfig.brand.name}</strong>.</p>
                    <p style={{ marginBottom: '30px' }}>يمكنك تعيين كلمة مرور جديدة من خلال الضغط على الزر أدناه (صالح لمدة ساعة):</p>
                    <PrimaryButton href={data.resetLink} text="إعادة تعيين كلمة المرور" />
                    <p style={{ fontSize: '13px', marginTop: '30px' }}>إذا لم تكن أنت من طلب هذا، فيرجى تجاهل هذا البريد ولن يتم تغيير أي شيء.</p>
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// Guest Welcome Email (Auto-registration)
export async function sendGuestWelcomeEmail(
    email: string, name: string, tempPassword: string
) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: email, subject: `تفاصيل الدخول لدورتك التدريبية يا ${name} 🎓`,
            react: (
                <EmailLayout headerTitle="تم إنشاء حسابك بنجاح!" headerEmoji="🎓">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{name}</strong>،</p>
                    <p>شكراً لانضمامك إلينا! لقد قمنا بإنشاء حساب خاص بك لتتمكن من الوصول إلى الدورات التي قمت بالتسجيل فيها بشكل دائم.</p>
                    <InfoBox>
                        <h3 style={{ margin: '0 0 15px 0', color: emailConfig.theme.textMain }}>بيانات الدخول المؤقتة:</h3>
                        <p style={{ margin: '8px 0' }}><strong>البريد الإلكتروني:</strong> {email}</p>
                        <p style={{ margin: '8px 0' }}><strong>كلمة المرور:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: emailConfig.theme.border, padding: '2px 6px', borderRadius: '4px' }}>{tempPassword}</span></p>
                        <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#dc2626' }}>* ننصح بشدة بتغيير كلمة المرور من صفحة الإعدادات فور تسجيل الدخول.</p>
                    </InfoBox>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/login`} text="تسجيل الدخول الآن" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

// UnderPaid Notification (للعميل)
export async function sendUnderPaidNotification(data: {
    to: string; customerName: string; orderNumber: string; paidAmount: number; totalAmount: number; remaining: number;
}) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `⚠️ تنبيه: دفعة كريبتو ناقصة للطلب ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle="دفعة غير مكتملة" headerEmoji="⚠️">
                    <p>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</p>
                    <p>لقد استلمنا العقد الخاص بك للطلب رقم الحصري <strong>{data.orderNumber}</strong>، ولكن تبين أن المبلغ المحول كان أقل من قيمة الطلب.</p>
                    <InfoBox isWarning={true}>
                        <p style={{ margin: '8px 0' }}><strong>المبلغ المطلوب:</strong> {data.totalAmount.toFixed(2)} USDT</p>
                        <p style={{ margin: '8px 0' }}><strong>المبلغ المُستلم فعلياً:</strong> {data.paidAmount.toFixed(2)} USDT</p>
                        <p style={{ margin: '8px 0', color: '#dc2626', fontWeight: 'bold' }}><strong>المبلغ المتبقي:</strong> {data.remaining.toFixed(2)} USDT</p>
                    </InfoBox>
                    <p>يرجى المبادرة بإرسال المبلغ المتبقي لنفس المحفظة لاستكمال عملية الشراء وتفعيل الطلب.</p>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/my-purchases`} text="عرض تفاصيل الطلب" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error };
    }
}
