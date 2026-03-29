const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export async function createNowPaymentsInvoice(data: {
    price_amount: number;
    price_currency: string;
    pay_currency: string;
    order_id: string;
    order_description: string;
}) {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
        method: 'POST',
        headers: {
            'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...data,
            ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment');
    }

    return response.json();
}

export async function getNowPaymentsStatus(paymentId: string) {
    const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
        method: 'GET',
        headers: {
            'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
        },
    });

    return response.json();
}
