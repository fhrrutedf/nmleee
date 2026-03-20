import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

/**
 * 2FA (Two-Factor Authentication) Helpers
 * استخدام مكتبة otplib (الإصدار 13+) لتوليد رموز TOTP
 */

/**
 * توليد سر جديد للمستخدم
 */
export function generateTwoFactorSecret(userEmail: string) {
    const secret = generateSecret();
    const otpauth = generateURI({
        issuer: 'Tmleen Platform',
        label: userEmail,
        secret: secret
    });
    return { secret, otpauth };
}

/**
 * توليد رمز QR لعرضه للمستخدم
 */
export async function generateQRCode(otpauth: string) {
    try {
        return await QRCode.toDataURL(otpauth);
    } catch (err) {
        console.error('QR Code generation error:', err);
        throw err;
    }
}

/**
 * التحقق من الرمز المدخل من قبل المستخدم
 */
export async function verifyTwoFactorToken(token: string, secret: string) {
    const result = await verify({ token, secret });
    return result.valid;
}

/**
 * SMS 2FA (Proposed logic for Twilio or similar)
 */
export async function sendSMSVerification(phone: string, code: string) {
    // This is where you'd call Twilio or a local SMS gateway
    console.log(`Sending SMS to ${phone} with code: ${code}`);
    // return await twilio.messages.create({ body: `رمز التحقق الخاص بك هو: ${code}`, to: phone, from: 'Tmleen' });
}
