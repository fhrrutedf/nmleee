/**
 * مكتبة تنقية المدخلات — تمنع XSS و SQL Injection
 * لا تعتمد على مكتبات خارجية لتقليل التبعيات
 */

// ── XSS: قائمة السمات والعلامات الخطرة ──────────────────────────
const DANGEROUS_TAGS = /<(script|iframe|object|embed|link|meta|style|form|input|button|svg|math)[^>]*>/gi;
const DANGEROUS_ATTRS = /\s(on\w+|javascript:|data:|vbscript:)\s*=/gi;
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
};

/**
 * تحويل HTML إلى نص آمن (يُستخدم لمدخلات النصوص العادية)
 */
export function escapeHtml(str: string): string {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * تنقية HTML — يُزيل التعليمات البرمجية الخطرة مع الإبقاء على التنسيق الأساسي
 * (للمحتوى الذي يقبل HTML محدود مثل الوصف)
 */
export function sanitizeHtml(html: string): string {
    if (typeof html !== 'string') return '';
    return html
        .replace(DANGEROUS_TAGS, '')
        .replace(DANGEROUS_ATTRS, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:text\/html/gi, '');
}

/**
 * تنقية سلسلة نصية عادية (يُزيل HTML كلياً)
 */
export function sanitizeText(str: string, maxLength = 1000): string {
    if (typeof str !== 'string') return '';
    return escapeHtml(str.trim().replace(/<[^>]*>/g, '')).slice(0, maxLength);
}

/**
 * التحقق من البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * التحقق من رقم الهاتف (دولي)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
    return typeof phone === 'string' && phoneRegex.test(phone.trim());
}

/**
 * التحقق من عنوان URL
 */
export function isValidUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return ['http:', 'https:'].includes(u.protocol);
    } catch {
        return false;
    }
}

/**
 * تنقية كائن JSON — يُطبق sanitizeText على جميع القيم النصية بشكل متكرر
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, maxLength = 1000): T {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeText(value, maxLength);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
            result[key] = value;
        } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = sanitizeObject(value, maxLength);
        } else if (Array.isArray(value)) {
            result[key] = value.map((item) =>
                typeof item === 'string' ? sanitizeText(item, maxLength) : item
            );
        } else {
            result[key] = value;
        }
    }
    return result as T;
}

/**
 * منع SQL Injection — تحقق أساسي (Prisma يعالجها تلقائياً، لكن للحذر الإضافي)
 */
export function containsSQLInjection(str: string): boolean {
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
    return sqlPatterns.test(str);
}

/**
 * تنقية شاملة لمدخلات API: تُزيل XSS + تتحقق من الطول + تُطبع السجل
 */
export function sanitizeApiInput(
    data: Record<string, any>,
    fieldLimits: Record<string, number> = {}
): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        const maxLen = fieldLimits[key] ?? 2000;
        if (typeof value === 'string') {
            result[key] = sanitizeText(value, maxLen);
        } else if (typeof value === 'number') {
            result[key] = isNaN(value) ? 0 : value;
        } else if (typeof value === 'boolean') {
            result[key] = value;
        } else if (value === null || value === undefined) {
            result[key] = value;
        } else if (typeof value === 'object') {
            result[key] = sanitizeObject(value, maxLen);
        }
    }
    return result;
}
