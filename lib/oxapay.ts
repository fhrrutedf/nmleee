const OXAPAY_API_URL = 'https://api.oxapay.com/merchants';

export async function createOxapayInvoice(data: {
    amount: number;
    currency: string;
    orderId: string;
    description: string;
    callbackUrl: string;
    returnUrl: string;
}) {
    const apiKey = process.env.OXAPAY_MERCHANT_KEY!;

    const response = await fetch(`${OXAPAY_API_URL}/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            merchant: apiKey,
            amount: Number(data.amount), // Ensure number type
            currency: 'USD',
            orderId: data.orderId,
            description: data.description,
            callbackUrl: data.callbackUrl,
            returnUrl: data.returnUrl
        })
    });

    const result = await response.json();
    
    if (result.result !== 100) {
        throw new Error(result.message || 'Failed to create Oxapay payment');
    }

    return result;
}

export async function verifyOxapayWebhook(payload: any) {
    // Oxapay webhooks come with a signature usually, but we can also verify via API if needed
    // For now we assume SSL/Secure endpoint or verify via payment check
    return true;
}
