import { authenticator } from 'otplib';
import QRCode from 'qrcode';

/**
 * 2FA (Two-Factor Authentication) Helpers
 * استخدام مكتبة otplib لتوليد رموز TOTP
 */

/**
 * توليد سر جديد للمستخدم
 */
export function generateTwoFactorSecret(userEmail: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, 'Tmleen Platform', secret);
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
export function verifyTwoFactorToken(token: string, secret: string) {
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
