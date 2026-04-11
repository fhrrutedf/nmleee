import { Html, Head, Body, Container, Section, Text, Button, Hr, Img, Link } from '@react-email/components';
import { emailConfig } from '../lib/email-config';

interface ManualOrderAlertEmailProps { adminName: string; orderNumber: string; customerName: string; customerEmail: string; amount: number; paymentMethod: string; orderId: string; proofUrl?: string; }

export default function ManualOrderAlertEmail({ adminName = 'المدير', orderNumber = 'ORD-123456', customerName = 'العميل', customerEmail = 'customer@example.com', amount = 50, paymentMethod = 'شام كاش', orderId = '123', proofUrl }: ManualOrderAlertEmailProps) {
    return (
        <Html dir="rtl" lang="ar">
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Body style={{ backgroundColor: emailConfig.theme.background, fontFamily: emailConfig.theme.fontFamily }}>
                <Container style={{ margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }}>
                    <Section style={{ backgroundColor: emailConfig.theme.surface, borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <Section style={{ textAlign: 'center' }}>
                            <Img src={emailConfig.brand.logoUrl} alt={emailConfig.brand.name} style={{ width: '150px', margin: '0 auto 25px' }} />
                            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '0 0 25px' }}>مرحباً {adminName}! 🔔</Text>
                        </Section>

                        <Section style={{ color: emailConfig.theme.textMuted, fontSize: '16px', textAlign: 'right' as const, lineHeight: '28px' }}>
                            <Section style={{ backgroundColor: '#fff7ed', borderRadius: '12px', padding: '20px', margin: '20px 0', border: '2px solid #ea580c' }}>
                                <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#c2410c', margin: '0', textAlign: 'center' as const }}>
                                    ⚠️ هنالك طلب تحويل يدوي يحتاج لتدخلك
                                </Text>
                            </Section>

                            <Hr style={{ borderColor: emailConfig.theme.border, margin: '20px 0' }} />

                            <Section style={{ margin: '20px 0', backgroundColor: emailConfig.theme.background, padding: '24px', borderRadius: '12px', border: `1px solid ${emailConfig.theme.border}` }}>
                                <Text style={{ fontSize: '18px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '0 0 15px' }}>تفاصيل المعاملة المعلقة:</Text>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>الرقم المرجعي (ID):</strong> {orderNumber}
                                </Text>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>اسم العميل:</strong> {customerName}
                                </Text>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>البريد الإلكتروني للعميل:</strong> {customerEmail}
                                </Text>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>المبلغ الإجمالي المحول المطالب به:</strong> <span style={{ color: '#ea580c', fontWeight: 'bold' }}>${amount.toFixed(2)}</span>
                                </Text>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>بوابة / طريقة التحويل:</strong> <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{paymentMethod}</span>
                                </Text>
                            </Section>

                            <Text style={{ fontSize: '15px', color: emailConfig.theme.textMuted, margin: '20px 0' }}>
                                يرجى مراجعة إثبات الدفع عبر لوحة تحكم الإدارة واتخاذ الإجراء اللازم والموافقة على الطلب ليتم تفعيله للعميل فوراً وبشكل تلقائي.
                            </Text>

                        </Section>

                        <Section style={{ textAlign: 'center', marginTop: '35px', marginBottom: '35px' }}>
                            <Button href={`${emailConfig.brand.baseUrl}/admin/manual-orders`} style={{ backgroundColor: emailConfig.theme.primary, borderRadius: '10px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '16px 36px', marginBottom: '15px', width: '100%', maxWidth: '300px' }}>
                                الانتقال لمعالجة الطلب
                            </Button>

                            {proofUrl && (
                                <Section style={{ marginTop: '10px' }}>
                                    <Button href={proofUrl} style={{ backgroundColor: emailConfig.theme.background, border: `2px solid ${emailConfig.theme.border}`, borderRadius: '10px', color: emailConfig.theme.textMain, fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '14px 34px', width: '100%', maxWidth: '300px' }}>
                                        📄 عرض مستند الإيصال
                                    </Button>
                                </Section>
                            )}
                        </Section>

                        <Hr style={{ borderColor: emailConfig.theme.border, margin: '40px 0 30px' }} />
                        
                        <Section style={{ textAlign: 'center' as const }}>
                            <Text style={{ color: emailConfig.theme.textMuted, fontSize: '14px', margin: '0 0 15px', lineHeight: '24px' }}>
                                إشعار داخلي خاص بالإدارة - لوحة التحكم<br />
                                <Link href={emailConfig.brand.baseUrl} style={{ color: emailConfig.theme.primary, textDecoration: 'none', fontWeight: 'bold' }}>{emailConfig.brand.name}</Link>
                            </Text>
                            
                            <Text style={{ color: '#94a3b8', fontSize: '12px', margin: '0' }}>{emailConfig.brand.footer}</Text>
                        </Section>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
