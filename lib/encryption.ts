import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.PAYMENT_ENCRYPTION_KEY || 'default-secret-key-32-chars-long!!'; // Must be 32 chars
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypt sensitive payment details
 */
export function encryptPaymentData(text: string): string {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption Error:', error);
        return text; // Fallback to plain if failed (not ideal, but prevents crash)
    }
}

/**
 * Decrypt sensitive payment details
 */
export function decryptPaymentData(text: string): string {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift()!, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // If decryption fails, it might be plain text from old records
        return text;
    }
}

/**
 * Helper to handle JSON objects
 */
export function encryptPaymentJson(data: any): string {
    return encryptPaymentData(JSON.stringify(data));
}

export function decryptPaymentJson(data: string | null): any {
    if (!data) return null;
    const decrypted = decryptPaymentData(data);
    try {
        return JSON.parse(decrypted);
    } catch {
        return decrypted;
    }
}
