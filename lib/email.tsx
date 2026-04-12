import { sendEmail } from './resend';
import OrderConfirmationEmail from '@/emails/OrderConfirmation';
import PayoutApprovedEmail from '@/emails/PayoutApproved';
import ManualOrderAlertEmail from '@/emails/ManualOrderAlert';
import { emailConfig } from './email-config';
import { Html, Head, Body, Container, Section, Text, Button, Hr, Img, Link } from '@react-email/components';

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'info@manasadigital.com';

// Reusable Master Layout for inline templates (Fully Responsive & UTF-8)
export const EmailLayout = ({ children, headerTitle, headerEmoji }: { children: React.ReactNode, headerTitle?: string, headerEmoji?: string }) => (
    <Html dir="rtl" lang="ar">
        <Head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Body style={{ backgroundColor: emailConfig.theme.background, fontFamily: emailConfig.theme.fontFamily }}>
            <Container style={{ margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }}>
                <Section style={{ backgroundColor: emailConfig.theme.surface, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    
                    <Section style={{ textAlign: 'center' }}>
                        <Img src={emailConfig.brand.logoUrl} alt={emailConfig.brand.name} style={{ width: '150px', margin: '0 auto 25px' }} />
                        {headerTitle && <Text style={{ color: emailConfig.theme.textMain, margin: '0 0 25px', fontSize: '24px', fontWeight: 'bold' }}>{headerTitle} {headerEmoji}</Text>}
                    </Section>
                    
                    <Section style={{ color: emailConfig.theme.textMuted, fontSize: '16px', textAlign: 'right' as const, lineHeight: '28px' }}>
                        {children}
                    </Section>
                    
                    <Hr style={{ borderColor: emailConfig.theme.border, margin: '40px 0 30px' }} />
                    
                    <Section style={{ textAlign: 'center' as const }}>
                        <Text style={{ color: emailConfig.theme.textMuted, fontSize: '14px', margin: '0 0 15px', lineHeight: '24px' }}>
                            هل تواجه أي مشكلة؟ فريقنا مستعد لمساعدتك عبر<br />
                            <Link href={`mailto:${emailConfig.brand.supportEmail}`} style={{ color: emailConfig.theme.primary, textDecoration: 'none', fontWeight: 'bold' }}>{emailConfig.brand.supportEmail}</Link>
                        </Text>
                        
                        <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Link href={emailConfig.brand.social.twitter} style={{ margin: '0 10px', color: emailConfig.theme.textMuted, textDecoration: 'none', fontSize: '13px' }}>تويتر (X)</Link>
                            <span style={{ color: emailConfig.theme.border }}>|</span>
                            <Link href={emailConfig.brand.social.instagram} style={{ margin: '0 10px', color: emailConfig.theme.textMuted, textDecoration: 'none', fontSize: '13px' }}>انستغرام</Link>
                            <span style={{ color: emailConfig.theme.border }}>|</span>
                            <Link href={emailConfig.brand.social.facebook} style={{ margin: '0 10px', color: emailConfig.theme.textMuted, textDecoration: 'none', fontSize: '13px' }}>فيسبوك</Link>
                        </Section>
                        
                        <Text style={{ color: '#94a3b8', fontSize: '12px', margin: '0' }}>{emailConfig.brand.footer}</Text>
                    </Section>
                    
                </Section>
            </Container>
        </Body>
    </Html>
);

export const PrimaryButton = ({ href, text }: { href: string; text: string }) => (
    <Section style={{ textAlign: 'center', marginTop: '35px', marginBottom: '35px' }}>
        <Button href={href} style={{
            backgroundColor: emailConfig.theme.primary, color: 'white', padding: '16px 36px',
            borderRadius: '10px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold', fontSize: '16px'
        }}>
            {text}
        </Button>
    </Section>
);

export const InfoBox = ({ children, isWarning = false }: { children: React.ReactNode, isWarning?: boolean }) => (
    <Section style={{ backgroundColor: isWarning ? '#fff7ed' : '#f8fafc', padding: '24px', borderRadius: '12px', margin: '25px 0', border: `1px solid ${isWarning ? '#fed7aa' : emailConfig.theme.border}` }}>
        <div style={{ textAlign: 'right', margin: 0, padding: 0 }}>
            {children}
        </div>
    </Section>
);

async function sendMail({ from, to, subject, html, react }: { from: string; to: string; subject: string; html?: string; react?: React.ReactElement; }) {
    const result = await sendEmail({ from: from || FROM_EMAIL, to, subject, html, react });
    if (!result.success) throw new Error(result.error);
    return result;
}

// Order Confirmation
export async function sendOrderConfirmation(data: { to: string; customerName: string; orderNumber: string; totalAmount: number; items: Array<{ title: string; price: number; link?: string; }>; }) {
    try {
        await sendMail({ from: FROM_EMAIL, to: data.to, subject: `تأكيد الطلب ${data.orderNumber}`, react: OrderConfirmationEmail(data) as React.ReactElement });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Payout Approved
export async function sendPayoutApproved(data: { to: string; sellerName: string; amount: number; method: string; payoutNumber: string; transactionId?: string; }) {
    try {
        await sendMail({ from: FROM_EMAIL, to: data.to, subject: `✅ تمت الموافقة على السحب ${data.payoutNumber}`, react: PayoutApprovedEmail(data) as React.ReactElement });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Payout Rejected
export async function sendPayoutRejected(data: { to: string; sellerName: string; amount: number; payoutNumber: string; reason: string; }) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `❌ تم رفض السحب ${data.payoutNumber}`,
            react: (
                <EmailLayout headerTitle={`مرحباً ${data.sellerName}`} headerEmoji="👋">
                    <Text style={{ margin: '0 0 15px' }}>للأسف، تم رفض طلب السحب الخاص بك بعد المراجعة.</Text>
                    <InfoBox isWarning={true}>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>رقم السحب:</strong> {data.payoutNumber}</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>المبلغ المسترد:</strong> ${data.amount.toFixed(2)}</Text>
                        <Text style={{ margin: '6px 0', color: '#dc2626' }}><strong>سبب الرفض:</strong> {data.reason}</Text>
                    </InfoBox>
                    <Text style={{ margin: '15px 0' }}>تم إرجاع المبلغ كاملاً إلى رصيدك المتاح، نعتذر عن هذا الإزعاج المؤقت.</Text>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/dashboard/earnings`} text="عرض الأرباح والتفاصيل" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Manual Order Alert (للأدمن)
export async function sendManualOrderAlert(data: { adminEmail: string; adminName: string; orderNumber: string; customerName: string; customerEmail: string; amount: number; paymentMethod: string; orderId: string; proofUrl?: string; }) {
    try {
        await sendMail({ from: FROM_EMAIL, to: data.adminEmail, subject: `🔔 طلب يدوي جديد: ${data.orderNumber}`, react: ManualOrderAlertEmail(data) as React.ReactElement });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Manual Order Review - (للعميل)
export async function sendManualOrderReview(data: { to: string; customerName: string; orderNumber: string; amount: number; }) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `⏳ نحن نراجع دفعتك للطلب ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle={`استلمنا طلبك بنجاح`} headerEmoji="⏳">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</Text>
                    <Text style={{ margin: '0 0 15px' }}>طلبك رقم <span style={{ fontWeight: 'bold', color: emailConfig.theme.textMain }}>{data.orderNumber}</span> قيد المراجعة الآن من قبل فرع الحسابات للتأكيد.</Text>
                    <InfoBox isWarning={true}>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>المبلغ المرصود للمعالجة:</strong> ${data.amount.toFixed(2)}</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>الحالة الحالية:</strong> قيد التحقق اليدوي</Text>
                    </InfoBox>
                    <Text style={{ margin: '15px 0', fontSize: '14px' }}>سيصلك إشعار فوري وتلقائي بمجرد تفعيل الطلب (يستغرق هذا الإجراء عادةً بين 15 دقيقة إلى ساعتين أثناء أوقات العمل).</Text>
                    <PrimaryButton href={emailConfig.brand.baseUrl} text="العودة للمتجر الرئيسي" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Manual Order Approved (للعميل)
export async function sendManualOrderApproved(data: { to: string; customerName: string; orderNumber: string; amount: number; courseId?: string; courseTitle?: string; from?: string; }) {
    try {
        const hasCourse = data.courseId && data.courseTitle;
        await sendMail({
            from: data.from || FROM_EMAIL, to: data.to, subject: `✅ تمت الموافقة على طلبك ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle="خبر سعيد! تمت الموافقة" headerEmoji="🎉">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</Text>
                    <Text style={{ margin: '0 0 15px' }}>تهانينا! لقد تمت المراجعة وتأكيد الدفعة بنجاح، المنتجات الآن نشطة في حسابك.</Text>
                    <InfoBox>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>رقم الطلب:</strong> {data.orderNumber}</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>المبلغ:</strong> ${data.amount.toFixed(2)}</Text>
                        {hasCourse && <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>الدورة:</strong> {data.courseTitle}</Text>}
                    </InfoBox>
                    {hasCourse ? (
                        <>
                            <Text style={{ color: emailConfig.theme.primaryDark, fontWeight: 'bold', margin: '20px 0 0', textAlign: 'center' }}>🎓 تم فتح صلاحية الدورة! ابدأ التعلم فوراً.</Text>
                            <PrimaryButton href={`${emailConfig.brand.baseUrl}/learn/${data.courseId}`} text="🎓 البدء بالدورة الآن" />
                        </>
                    ) : (
                        <PrimaryButton href={emailConfig.brand.baseUrl} text="🏠 العودة للمتجر" />
                    )}
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Manual Order Rejected (للعميل)
export async function sendManualOrderRejected(data: { to: string; customerName: string; orderNumber: string; reason: string; from?: string; }) {
    try {
        await sendMail({
            from: data.from || FROM_EMAIL, to: data.to, subject: `❌ ملاحظة بخصوص طلبك ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle="تحديث بخصوص طلبك" headerEmoji="⚠️">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</Text>
                    <Text style={{ margin: '0 0 15px' }}>نأسف لإبلاغك بأنه لم نتمكن من اعتماد طلبك بعد مراجعة بيانات الحوالة المقدمة.</Text>
                    <InfoBox isWarning={true}>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>الطلب المرجعي:</strong> {data.orderNumber}</Text>
                        <Text style={{ margin: '6px 0', color: '#dc2626' }}><strong>الملاحظات (سبب الرفض):</strong> {data.reason}</Text>
                    </InfoBox>
                    <Text style={{ margin: '15px 0' }}>يرجى قراءة الملاحظات ومراجعتها. إذا كنت تعتقد بوجود خطأ، لا تتردد بالتواصل مع فريقنا.</Text>
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Subscription Confirmation
export async function sendSubscriptionConfirmation(data: { to: string; customerName: string; planName: string; amount: number; billingCycle: string; }) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `✅ تم تفعيل اشتراكك في باقة ${data.planName}`,
            react: (
                <EmailLayout headerTitle="تم تفعيل اشتراكك!" headerEmoji="🚀">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</Text>
                    <Text style={{ margin: '0 0 15px' }}>شكراً لثقتك بنا. نحن سعداء جداً بانضمامك ودعم مسيرتك الرقمية بالكامل.</Text>
                    <InfoBox>
                        <Text style={{ margin: '0 0 15px 0', color: emailConfig.theme.textMain, fontWeight: 'bold' }}>تفاصيل اشتراكك الاحترافي:</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>الباقة النشطة:</strong> {data.planName}</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>الدورة الزمنية:</strong> {data.billingCycle === 'month' ? 'شهرياً' : 'سنوياً'}</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>الرسوم:</strong> ${data.amount.toFixed(2)}</Text>
                    </InfoBox>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/dashboard/billing`} text="إدارة اعدادات الاشتراك" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Welcome Email
export async function sendWelcomeEmail(userId: string, email: string, name: string, username: string) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: email, subject: `مرحباً بك في ${emailConfig.brand.name} يا ${name}! 🎉`,
            react: (
                <EmailLayout headerTitle="أهلاً بك معنا!" headerEmoji="🚀">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{name}</strong>،</Text>
                    <Text style={{ margin: '0 0 15px' }}>نحتفل اليوم بانضمامك لعائلة <strong>{emailConfig.brand.name}</strong>. نحن مسخرون لتيسير إطلاق منتجاتك الرقمية وتطوير عملك بدون أي تعقيدات تقنية.</Text>
                    <InfoBox>
                        <Text style={{ margin: '0 0 15px 0', color: emailConfig.theme.textMain, fontWeight: 'bold' }}>البطاقة التعريفية لمتجرك:</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>الاسم المسجل:</strong> {name}</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}>
                            <strong>رابط المتجر:</strong> <Link href={`${emailConfig.brand.baseUrl}/${username}`} style={{ color: emailConfig.theme.primary, textDecoration: 'none' }}>{emailConfig.brand.baseUrl.replace('https://', '')}/{username}</Link>
                        </Text>
                    </InfoBox>
                    <Text style={{ margin: '15px 0' }}>ابدأ برفع أول منتج لك واستعد لتلبية احتياجات عملائك!</Text>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/dashboard`} text="الدخول المباشر للوحة التحكم" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Reset Password Email
export async function sendResetPasswordEmail(data: { to: string; customerName: string; resetLink: string; }) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `إعادة تعيين كلمة المرور | ${emailConfig.brand.name}`,
            react: (
                <EmailLayout headerTitle="تعيين كلمة مرور جديدة" headerEmoji="🔐">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</Text>
                    <Text style={{ margin: '0 0 15px' }}>تلقينا مؤخراً طلباً لتحديث كلمة المرور لحسابك المرتبط بنا.</Text>
                    <Text style={{ margin: '0 0 15px' }}>لإنهاء العملية وإعداد كلمة مرور جديدة بأمان، يرجى النقر على الزر أدناه (هذا الإجراء صالح لمدة 60 دقيقة فقط للحماية):</Text>
                    <PrimaryButton href={data.resetLink} text="إعادة تعيين كلمة المرور" />
                    <Text style={{ fontSize: '13px', margin: '20px 0 0', color: emailConfig.theme.textMuted }}>إشعار أمني: في حال لم تكن أنت صاحب هذا الطلب، يرجى تجاهله تماماً ولن يجري أي تغيير.</Text>
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// Guest Welcome Email (Auto-registration)
export async function sendGuestWelcomeEmail(email: string, name: string, tempPassword: string) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: email, subject: `تفاصيل الدخول لدورتك التدريبية يا ${name} 🎓`,
            react: (
                <EmailLayout headerTitle="إعداد حسابك الذكي" headerEmoji="🎓">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{name}</strong>! يسعدنا وجودك.</Text>
                    <Text style={{ margin: '0 0 15px' }}>بصفتك ضيفاً جديداً، وكي نضمن لك وصول دائم وفوري للمحتوى الذي دفعته، تم إنشاء مساحة مخصصة لك تلقائياً.</Text>
                    <InfoBox>
                        <Text style={{ margin: '0 0 15px 0', color: emailConfig.theme.textMain, fontWeight: 'bold' }}>بيانات الدخول (مؤقتة للحماية):</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>بريدك الإلكتروني:</strong> {email}</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>كلمة مرور النظام:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: emailConfig.theme.border, padding: '4px 8px', borderRadius: '4px' }}>{tempPassword}</span></Text>
                        <Text style={{ margin: '15px 0 0 0', fontSize: '13px', color: '#dc2626' }}>* من الضروري تغيير كلمة المرور فور دخولك من صفحة حسابك للحفاظ على الأمان.</Text>
                    </InfoBox>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/login`} text="التسجيل والبدء للدورة" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// UnderPaid Notification (للعميل)
export async function sendUnderPaidNotification(data: { to: string; customerName: string; orderNumber: string; paidAmount: number; totalAmount: number; remaining: number; }) {
    try {
        await sendMail({
            from: FROM_EMAIL, to: data.to, subject: `⚠️ دفعة كريبتو غير مكتملة للطلب ${data.orderNumber}`,
            react: (
                <EmailLayout headerTitle="إشعار رصيد حوالة معلق" headerEmoji="⚠️">
                    <Text style={{ margin: '0 0 15px' }}>مرحباً <strong style={{ color: emailConfig.theme.primary }}>{data.customerName}</strong>،</Text>
                    <Text style={{ margin: '0 0 15px' }}>لاحظنا وصول تحويلك المالي لعقد الطلب <strong style={{ color: emailConfig.theme.textMain }}>{data.orderNumber}</strong> بناءً على تتبع الـ Blockchain. غير أن التغطية المالية كانت أقل من التسعيرة.</Text>
                    <InfoBox isWarning={true}>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>المطلوب الإجمالي:</strong> {data.totalAmount.toFixed(2)} USDT</Text>
                        <Text style={{ margin: '6px 0', color: emailConfig.theme.textMain }}><strong>ما تم استلامه وتوثيقه:</strong> {data.paidAmount.toFixed(2)} USDT</Text>
                        <Text style={{ margin: '6px 0', color: '#dc2626', fontWeight: 'bold' }}><strong>المبلغ العجز المعلق:</strong> {data.remaining.toFixed(2)} USDT</Text>
                    </InfoBox>
                    <Text style={{ margin: '15px 0' }}>لطفاً، استكمل تحويل المبلغ المتبقي على ذات المحفظة لتفادي إلغاء الطلب ولتتم المعالجة آلياً وفوراً.</Text>
                    <PrimaryButton href={`${emailConfig.brand.baseUrl}/`} text="العودة للمتجر الرئيسي" />
                </EmailLayout>
            ) as React.ReactElement,
        });
        return { success: true };
    } catch (error) { return { success: false, error }; }
}
