import crypto from 'crypto';

const CRYPTOMUS_API_URL = 'https://api.cryptomus.com/v1';

export async function createCryptomusInvoice(data: {
    amount: string;
    currency: string;
    orderId: string;
    callbackUrl: string;
    successUrl: string;
}) {
    const merchantId = process.env.CRYPTOMUS_MERCHANT_ID!;
    const apiKey = process.env.CRYPTOMUS_PAYMENT_KEY!;

    const payload = JSON.stringify({
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        url_callback: data.callbackUrl,
        url_success: data.successUrl,
        is_payment_any: true // Allows user to choose any coin
    });

    const sign = crypto
        .createHash('md5')
        .update(Buffer.from(payload).toString('base64') + apiKey)
        .digest('hex');

    const response = await fetch(`${CRYPTOMUS_API_URL}/payment`, {
        method: 'POST',
        headers: {
            'merchant': merchantId,
            'sign': sign,
            'Content-Type': 'application/json'
        },
        body: payload
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create Cryptomus payment');
    }

    const result = await response.json();
    return result.result;
}

export async function verifyCryptomusSignature(payload: any, signature: string) {
    const apiKey = process.env.CRYPTOMUS_PAYMENT_KEY!;
    const { sign, ...dataWithoutSign } = payload;
    
    const checkSign = crypto
        .createHash('md5')
        .update(Buffer.from(JSON.stringify(dataWithoutSign)).toString('base64') + apiKey)
        .digest('hex');

    return checkSign === signature;
}
