import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Hr,
} from '@react-email/components';

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
                        <Text style={heading}>مرحباً {adminName}! 🔔</Text>

                        <Section style={alertBox}>
                            <Text style={alertText}>
                                ⚠️ طلب يدوي جديد يحتاج للمراجعة
                            </Text>
                        </Section>

                        <Hr style={hr} />

                        <Section style={detailsSection}>
                            <Text style={sectionTitle}>تفاصيل الطلب:</Text>
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
                                <strong>طريقة الدفع:</strong> {paymentMethod}
                            </Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={infoText}>
                            يرجى مراجعة إثبات الدفع والموافقة على الطلب أو رفضه.
                        </Text>

                        <Button
                            href={`https://tmleen.com/admin/manual-orders`}
                            style={button}
                        >
                            مراجعة الطلب
                        </Button>

                        {proofUrl && (
                            <Button
                                href={proofUrl}
                                style={{ ...button, backgroundColor: '#0ea5e9', marginLeft: '10px' }}
                            >
                                📄 عرض الإيصال (رابط آمن)
                            </Button>
                        )}

                        <Text style={footer}>
                            منصة Tmleen - لوحة التحكم
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: 'Arial, sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
};

const box = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const heading = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0 0 20px',
};

const alertBox = {
    backgroundColor: '#fef3c7',
    borderRadius: '6px',
    padding: '16px',
    margin: '20px 0',
    border: '2px solid #f59e0b',
};

const alertText = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#d97706',
    margin: '0',
    textAlign: 'center' as const,
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const sectionTitle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0 0 15px',
};

const detailsSection = {
    margin: '20px 0',
};

const detailItem = {
    fontSize: '16px',
    color: '#666666',
    margin: '10px 0',
    lineHeight: '24px',
};

const infoText = {
    fontSize: '14px',
    color: '#666666',
    margin: '20px 0',
};

const button = {
    backgroundColor: '#f59e0b',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    margin: '20px 0',
};

const footer = {
    fontSize: '12px',
    color: '#999999',
    textAlign: 'center' as const,
    marginTop: '30px',
};
