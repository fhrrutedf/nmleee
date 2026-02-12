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
                        <Text style={heading}>مرحباً {sellerName}! 💰</Text>

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
                            سيتم تحويل المبلغ إلى حسابك خلال 3-5 أيام عمل.
                        </Text>

                        <Button
                            href="https://tmleen.com/dashboard/earnings"
                            style={button}
                        >
                            عرض الأرباح
                        </Button>

                        <Text style={footer}>
                            شكراً لك - منصة Tmleen
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

const successBox = {
    backgroundColor: '#d1fae5',
    borderRadius: '6px',
    padding: '16px',
    margin: '20px 0',
};

const successText = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#059669',
    margin: '0',
    textAlign: 'center' as const,
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
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
    backgroundColor: '#fef3c7',
    padding: '12px',
    borderRadius: '6px',
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
