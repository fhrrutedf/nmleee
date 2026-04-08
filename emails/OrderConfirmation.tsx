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

interface OrderConfirmationEmailProps {
    customerName: string;
    orderNumber: string;
    totalAmount: number;
    items: Array<{
        title: string;
        price: number;
    }>;
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
                        <Text style={heading}>مرحباً {customerName}! 🎉</Text>

                        <Text style={paragraph}>
                            شكراً لك! تم استلام طلبك بنجاح.
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
                            المجموع: ${totalAmount.toFixed(2)}
                        </Text>

                        <Button
                            href={`https://manasadigital.com/orders`}
                            style={button}
                        >
                            عرض الطلبات
                        </Button>

                        <Text style={footer}>
                            شكراً لاستخدامك منصة MANASA DIGITAL
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

const paragraph = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '24px',
    margin: '0 0 20px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const orderNumberText = {
    fontSize: '14px',
    color: '#999999',
    margin: '10px 0',
};

const sectionTitle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '20px 0 10px',
};

const itemsSection = {
    margin: '20px 0',
};

const itemText = {
    fontSize: '14px',
    color: '#666666',
    margin: '5px 0',
    lineHeight: '20px',
};

const totalText = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#10b981',
    margin: '20px 0',
};

const button = {
    backgroundColor: '#4f46e5',
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
