import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from '@react-email/components';
import { emailConfig } from '../lib/email-config';

interface PayoutApprovedEmailProps {
    sellerName: string;
    amount: number;
    method: string;
    payoutNumber: string;
    transactionId?: string;
}

export default function PayoutApprovedEmail({
    sellerName = 'البائع',
    amount = 100,
    method = 'Bank Transfer',
    payoutNumber = 'PAYOUT-123',
    transactionId = '',
}: PayoutApprovedEmailProps) {
    const methodAr: Record<string, string> = {
        bank: 'تحويل بنكي',
        paypal: 'PayPal',
        crypto: 'عملة رقمية (USDT)',
    };

    return (
        <Html dir="rtl" lang="ar">
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={box}>
                        <Section style={centerAlign}>
                            <Img src={emailConfig.brand.logoUrl} alt={emailConfig.brand.name} style={logo} />
                            <Text style={heading}>مرحباً {sellerName}! 💰</Text>
                        </Section>

                        <Section style={successBox}>
                            <Text style={successText}>
                                ✅ تمت الموافقة على طلب السحب
                            </Text>
                        </Section>

                        <Hr style={hr} />

                        <Section style={detailsSection}>
                            <Text style={detailItem}>
                                <strong>رقم السحب:</strong> {payoutNumber}
                            </Text>
                            <Text style={detailItem}>
                                <strong>المبلغ:</strong> ${amount.toFixed(2)}
                            </Text>
                            <Text style={detailItem}>
                                <strong>الطريقة:</strong> {methodAr[method] || method}
                            </Text>
                            {transactionId && (
                                <Text style={detailItem}>
                                    <strong>رقم التحويل:</strong> {transactionId}
                                </Text>
                            )}
                        </Section>

                        <Hr style={hr} />

                        <Text style={infoText}>
                            سيتم تحويل المبلغ إلى حسابك المحدد قريباً أو تم تحويله بالفعل بناءً على توقيت التنفيذ.
                        </Text>

                        <Section style={centerAlign}>
                            <Button href={`${emailConfig.brand.baseUrl}/dashboard/earnings`} style={button}>
                                الاستمرار ومتابعة الأرباح
                            </Button>
                        </Section>

                        <Hr style={hr} />
                        <Text style={footer}>
                            {emailConfig.brand.footer}
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
const successBox = { backgroundColor: '#ECFDF5', borderRadius: '8px', padding: '16px', margin: '20px 0', border: `1px solid ${emailConfig.theme.primary}` };
const successText = { fontSize: '18px', fontWeight: 'bold', color: emailConfig.theme.primaryDark, margin: '0', textAlign: 'center' as const };
const hr = { borderColor: emailConfig.theme.border, margin: '20px 0' };
const detailsSection = { margin: '20px 0' };
const detailItem = { fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' };
const infoText = { fontSize: '14px', color: emailConfig.theme.textMuted, backgroundColor: emailConfig.theme.background, padding: '16px', borderRadius: '8px', margin: '20px 0' };
const button = { backgroundColor: emailConfig.theme.primary, borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '16px 32px', margin: '20px 0' };
const footer = { fontSize: '12px', color: emailConfig.theme.textMuted, textAlign: 'center' as const, marginTop: '30px' };
