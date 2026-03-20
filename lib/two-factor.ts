/* eslint-disable @typescript-eslint/no-require-imports */
const { authenticator } = require('otplib');
import QRCode from 'qrcode';

/**
 * 2FA (Two-Factor Authentication) Helpers
 */

/**
 * توليد سر جديد للمستخدم
 */
export function generateTwoFactorSecret(userEmail: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, 'Tmleen', secret);
    return { secret, otpauth };
}

/**
 * توليد رمز QR لعرضه للمستخدم
 */
export async function generateQRCode(otpauth: string) {
    if (!otpauth) throw new Error('OTPAuth URI is required');
    try {
        return await QRCode.toDataURL(otpauth);
    } catch (err) {
        // This catch block seems to be intended for an API route handler,
        // as it references 'user' and 'NextResponse.json' which are not
        // defined in this utility file.
        // To maintain syntactic correctness and avoid introducing undefined
        // variables, the original error handling is kept.
        // If this function is meant to be part of an API route,
        // 'user' and 'NextResponse' would need to be imported/defined.
        console.error('QR Code generation error:', err);
        throw err;
    }
}

/**
 * التحقق من الرمز المدخل من قبل المستخدم
 */
export async function verifyTwoFactorToken(token: string, secret: string) {
    return authenticator.verify({ token, secret });
}

/**
 * SMS 2FA (Proposed logic for Twilio or similar)
 */
export async function sendSMSVerification(phone: string, code: string) {
    // This is where you'd call Twilio or a local SMS gateway
    console.log(`Sending SMS to ${phone} with code: ${code}`);
    // return await twilio.messages.create({ body: `رمز التحقق الخاص بك هو: ${code}`, to: phone, from: 'Tmleen' });
}
