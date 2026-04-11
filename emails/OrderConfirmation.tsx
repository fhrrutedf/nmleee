import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from '@react-email/components';
import { emailConfig } from '../lib/email-config';

interface OrderConfirmationEmailProps {
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{ title: string; price: number }>;
}

export default function OrderConfirmationEmail({
    customerName = 'العميل',
    orderNumber = 'ORD-123456',
    totalAmount = 50,
    items = [],
}: OrderConfirmationEmailProps) {
    return (
        <Html dir="rtl" lang="ar">
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={box}>
                        <Section style={centerAlign}>
                            <Img src={emailConfig.brand.logoUrl} alt={emailConfig.brand.name} style={logo} />
                            <Text style={heading}>مرحباً {customerName}! 🎉</Text>
                        </Section>

                        <Text style={paragraph}>
                            شكراً لك! تم استلام طلبك بنجاح. نحن نعمل على تجهيز المعاملة بشكل فوري.
                        </Text>

                        <Hr style={hr} />

                        <Text style={orderNumberText}>
                            رقم الطلب: <strong>{orderNumber}</strong>
                        </Text>

                        <Section style={itemsSection}>
                            <Text style={sectionTitle}>المنتجات:</Text>
                            {items.map((item, idx) => (
                                <Text key={idx} style={itemText}>
                                    • {item.title} - ${item.price.toFixed(2)}
                                </Text>
                            ))}
                        </Section>

                        <Hr style={hr} />

                        <Text style={totalText}>
                            المجموع الدفع: ${totalAmount.toFixed(2)}
                        </Text>

                        <Section style={centerAlign}>
                            <Button href={`${emailConfig.brand.baseUrl}/orders`} style={button}>
                                عرض الطلبات
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
const paragraph = { fontSize: '16px', color: emailConfig.theme.textMuted, lineHeight: '24px', margin: '0 0 20px' };
const hr = { borderColor: emailConfig.theme.border, margin: '20px 0' };
const orderNumberText = { fontSize: '15px', color: emailConfig.theme.textMuted, margin: '10px 0' };
const sectionTitle = { fontSize: '16px', fontWeight: 'bold', color: emailConfig.theme.textMain, margin: '20px 0 10px' };
const itemsSection = { margin: '20px 0', backgroundColor: emailConfig.theme.background, padding: '15px', borderRadius: '8px' };
const itemText = { fontSize: '15px', color: emailConfig.theme.textMain, margin: '5px 0', lineHeight: '20px' };
const totalText = { fontSize: '20px', fontWeight: 'bold', color: emailConfig.theme.primaryDark, margin: '20px 0' };
const button = { backgroundColor: emailConfig.theme.primary, borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '16px 32px', margin: '20px 0' };
const footer = { fontSize: '12px', color: emailConfig.theme.textMuted, textAlign: 'center' as const, marginTop: '30px' };
