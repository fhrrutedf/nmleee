import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from '@react-email/components';
import { emailConfig } from '../lib/email-config';

interface ManualOrderAlertEmailProps {
    adminName: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    paymentMethod: string;
    orderId: string;
    proofUrl?: string;
}

export default function ManualOrderAlertEmail({
    adminName = 'المدير',
    orderNumber = 'ORD-123456',
    customerName = 'العميل',
    customerEmail = 'customer@example.com',
    amount = 50,
    paymentMethod = 'شام كاش',
    orderId = '123',
    proofUrl,
}: ManualOrderAlertEmailProps) {
    return (
        <Html dir="rtl" lang="ar">
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={box}>
                        <Section style={centerAlign}>
                            <Img src={emailConfig.brand.logoUrl} alt={emailConfig.brand.name} style={logo} />
                            <Text style={heading}>مرحباً {adminName}! 🔔</Text>
                        </Section>

                        <Section style={alertBox}>
                            <Text style={alertText}>
                                ⚠️ طلب يدوي جديد يحتاج للمراجعة (Action Required)
                            </Text>
                        </Section>

                        <Hr style={hr} />

                        <Section style={detailsSection}>
                            <Text style={sectionTitle}>تفاصيل الطلب المستلم:</Text>
                            <Text style={detailItem}>
                                <strong>رقم الطلب:</strong> {orderNumber}
                            </Text>
                            <Text style={detailItem}>
                                <strong>العميل:</strong> {customerName}
                            </Text>
                            <Text style={detailItem}>
                                <strong>البريد:</strong> {customerEmail}
                            </Text>
                            <Text style={detailItem}>
                                <strong>المبلغ:</strong> ${amount.toFixed(2)}
                            </Text>
                            <Text style={detailItem}>
                                <strong>طريقة الدفع المختارة:</strong> {paymentMethod}
                            </Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={infoText}>
                            يرجى مراجعة إثبات الدفع عبر لوحة التحكم واتخاذ الإجراء اللازم والموافقة على الطلب ليتم تفعيله للعميل تلقائياً.
                        </Text>

                        <Section style={centerAlign}>
                            <Button href={`${emailConfig.brand.baseUrl}/admin/manual-orders`} style={buttonPrimary}>
                                الانتقال لمراجعة الطلب
                            </Button>

                            {proofUrl && (
                                <div style={{ marginTop: '10px' }}>
                                    <Button href={proofUrl} style={buttonSecondary}>
                                        📄 عرض الإيصال مباشرة
                                    </Button>
                                </div>
                            )}
                        </Section>

                        <Hr style={hr} />
                        <Text style={footer}>
                            {emailConfig.brand.footer} · إشعارات الإدارة الداخلية
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = { backgroundColor: emailConfig.theme.background, fontFamily: emailConfig.theme.fontFamily };
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' };
const box = { backgroundColor: emailConfig.theme.surface, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const centerAlign = { textAlign: 'center' as const };
const logo = { width: '150px', margin: '0 auto 20px auto' };
const heading = { fontSize: '24px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '0 0 20px' };
const alertBox = { backgroundColor: '#fff7ed', borderRadius: '8px', padding: '16px', margin: '20px 0', border: '2px solid #ea580c' }; // Orange warning
const alertText = { fontSize: '18px', fontWeight: 'bold', color: '#c2410c', margin: '0', textAlign: 'center' as const };
const hr = { borderColor: emailConfig.theme.border, margin: '20px 0' };
const sectionTitle = { fontSize: '18px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '0 0 15px' };
const detailsSection = { margin: '20px 0' };
const detailItem = { fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' };
const infoText = { fontSize: '15px', color: emailConfig.theme.textMuted, margin: '20px 0' };
const buttonPrimary = { backgroundColor: emailConfig.theme.primary, borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '16px 32px' };
const buttonSecondary = { backgroundColor: emailConfig.theme.background, border: `1px solid ${emailConfig.theme.border}`, borderRadius: '8px', color: emailConfig.theme.textMain, fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 24px' };
const footer = { fontSize: '12px', color: emailConfig.theme.textMuted, textAlign: 'center' as const, marginTop: '30px' };
