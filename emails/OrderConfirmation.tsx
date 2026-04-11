import { Html, Head, Body, Container, Section, Text, Button, Hr, Img, Link } from '@react-email/components';
import { emailConfig } from '../lib/email-config';

interface OrderConfirmationEmailProps { customerName: string; orderNumber: string; totalAmount: number; items: Array<{ title: string; price: number }>; }

export default function OrderConfirmationEmail({ customerName = 'العميل', orderNumber = 'ORD-123456', totalAmount = 50, items = [] }: OrderConfirmationEmailProps) {
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
                            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '0 0 25px' }}>مرحباً {customerName}! 🎉</Text>
                        </Section>

                        <Section style={{ color: emailConfig.theme.textMuted, fontSize: '16px', textAlign: 'right' as const, lineHeight: '28px' }}>
                            <Text style={{ margin: '0 0 15px' }}>
                                شكراً لك! تم استلام طلبك بنجاح. نحن نعمل على تجهيز المعاملة بشكل فوري.
                            </Text>
                            
                            <Hr style={{ borderColor: emailConfig.theme.border, margin: '20px 0' }} />
                            
                            <Text style={{ fontSize: '15px', color: emailConfig.theme.textMuted, margin: '15px 0' }}>
                                رقم الطلب المعرف: <strong style={{ color: emailConfig.theme.textMain }}>{orderNumber}</strong>
                            </Text>

                            <Section style={{ margin: '20px 0', backgroundColor: emailConfig.theme.background, padding: '20px', borderRadius: '12px', border: `1px solid ${emailConfig.theme.border}` }}>
                                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '0 0 15px' }}>المنتجات:</Text>
                                {items.map((item, idx) => (
                                    <Text key={idx} style={{ fontSize: '15px', color: emailConfig.theme.textMain, margin: '8px 0', lineHeight: '24px' }}>
                                        • {item.title} <span style={{ fontWeight: 'bold', color: emailConfig.theme.primaryDark }}>${item.price.toFixed(2)}</span>
                                    </Text>
                                ))}
                                <Hr style={{ borderColor: emailConfig.theme.border, margin: '15px 0' }} />
                                <Text style={{ fontSize: '18px', fontWeight: 'bold', color: emailConfig.theme.primaryDark, margin: '10px 0 0' }}>
                                    المجموع النهائي: ${totalAmount.toFixed(2)}
                                </Text>
                            </Section>
                        </Section>

                        <Section style={{ textAlign: 'center', marginTop: '35px', marginBottom: '35px' }}>
                            <Button href={`${emailConfig.brand.baseUrl}/my-purchases`} style={{ backgroundColor: emailConfig.theme.primary, borderRadius: '10px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '16px 36px' }}>
                                عرض مشترياتي والمحتوى
                            </Button>
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
}
