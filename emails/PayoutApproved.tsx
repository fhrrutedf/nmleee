import { Html, Head, Body, Container, Section, Text, Button, Hr, Img, Link } from '@react-email/components';
import { emailConfig } from '../lib/email-config';

interface PayoutApprovedEmailProps { sellerName: string; amount: number; method: string; payoutNumber: string; transactionId?: string; }

export default function PayoutApprovedEmail({ sellerName = 'البائع', amount = 100, method = 'Bank Transfer', payoutNumber = 'PAYOUT-123', transactionId = '' }: PayoutApprovedEmailProps) {
    const methodAr: Record<string, string> = { bank: 'تحويل بنكي', paypal: 'PayPal', crypto: 'عملة رقمية (USDT)' };

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
                            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '0 0 25px' }}>مرحباً {sellerName}! 💰</Text>
                        </Section>

                        <Section style={{ color: emailConfig.theme.textMuted, fontSize: '16px', textAlign: 'right' as const, lineHeight: '28px' }}>
                            <Section style={{ backgroundColor: '#ECFDF5', borderRadius: '12px', padding: '20px', margin: '20px 0', border: `1px solid ${emailConfig.theme.primary}` }}>
                                <Text style={{ fontSize: '18px', fontWeight: 'bold', color: emailConfig.theme.primaryDark, margin: '0', textAlign: 'center' as const }}>
                                    ✅ تمت الموافقة على طلب السحب بنجاح
                                </Text>
                            </Section>

                            <Hr style={{ borderColor: emailConfig.theme.border, margin: '20px 0' }} />

                            <Section style={{ margin: '20px 0', backgroundColor: emailConfig.theme.background, padding: '24px', borderRadius: '12px', border: `1px solid ${emailConfig.theme.border}` }}>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>رقم مرجع السحب:</strong> {payoutNumber}
                                </Text>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>المبلغ الإجمالي المسحوب:</strong> <span style={{ color: emailConfig.theme.primaryDark, fontWeight: 'bold' }}>${amount.toFixed(2)}</span>
                                </Text>
                                <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                    <strong>طريقة الدفع المحددة:</strong> {methodAr[method] || method}
                                </Text>
                                {transactionId && (
                                    <Text style={{ fontSize: '16px', color: emailConfig.theme.textMain, margin: '10px 0', lineHeight: '24px' }}>
                                        <strong>رقم توثيق التحويل (TX):</strong> <span style={{ fontFamily: 'monospace' }}>{transactionId}</span>
                                    </Text>
                                )}
                            </Section>

                            <Text style={{ fontSize: '15px', color: emailConfig.theme.textMuted, margin: '20px 0' }}>
                                معلومات: سيتم إيداع المبلغ إلى حسابك المحدد قريباً جداً، أو تم تحويله بالفعل بناءً على توقيت التنفيذ البنكي لطريقة الدفع المختارة. شكراً لجهودك كشريك مميز لدينا!
                            </Text>
                        </Section>

                        <Section style={{ textAlign: 'center', marginTop: '35px', marginBottom: '35px' }}>
                            <Button href={`${emailConfig.brand.baseUrl}/dashboard/earnings`} style={{ backgroundColor: emailConfig.theme.primary, borderRadius: '10px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '16px 36px' }}>
                                عرض تقارير الأرباح
                            </Button>
                        </Section>

                        <Hr style={{ borderColor: emailConfig.theme.border, margin: '40px 0 30px' }} />
                        
                        <Section style={{ textAlign: 'center' as const }}>
                            <Text style={{ color: emailConfig.theme.textMuted, fontSize: '14px', margin: '0 0 15px', lineHeight: '24px' }}>
                                هل لديك استفسار بخصوص دفعتك؟ الدعم متاح عبر<br />
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
}
