/**
 * Rate Limiting — يستخدم جدول RateLimit الموجود في قاعدة البيانات
 * الهيكل الفعلي: (id, ip, key, count, lastAttempt, points, expire)
 * الحدود الافتراضية: 100 طلب / دقيقة لكل IP
 */
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

// In-memory cache لتخفيف الضغط على قاعدة البيانات
const memCache = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
    identifier: string;  // اسم النقطة مثال: 'api:checkout'
    limit?: number;      // الحد الأقصى
    windowSeconds?: number; // النافذة الزمنية
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetAt: Date;
}

/**
 * يستخرج IP الحقيقي من الطلب (Cloudflare / Vercel)
 */
export function getClientIP(req: NextRequest): string {
    return (
        req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-real-ip') ||
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        '127.0.0.1'
    );
}

/**
 * التحقق من Rate Limit
 */
export async function checkRateLimit(
    req: NextRequest,
    options: RateLimitOptions
): Promise<RateLimitResult> {
    const { identifier, limit = 100, windowSeconds = 60 } = options;

    const ip = getClientIP(req);
    const key = `${identifier}:${ip}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const resetAt = new Date(Math.ceil(now / windowMs) * windowMs);

    // ── In-memory fast path ──────────────────────────────────────────
    const cached = memCache.get(key);
    if (cached && cached.resetAt > now) {
        cached.count++;
        memCache.set(key, cached);
        const remaining = Math.max(0, limit - cached.count);
        return {
            success: cached.count <= limit,
            limit,
            remaining,
            resetAt: new Date(cached.resetAt),
        };
    }

    // ── Reset أو أول طلب ─────────────────────────────────────────────
    memCache.set(key, { count: 1, resetAt: resetAt.getTime() });

    // ── تسجيل في DB (متوافق مع الهيكل الفعلي) ─────────────────────
    try {
        await prisma.rateLimit.upsert({
            where: { ip_key: { ip, key } },
            create: {
                ip,
                key,
                count: 1,
                lastAttempt: new Date(),
            },
            update: {
                count: { increment: 1 },
                lastAttempt: new Date(),
            },
        });
    } catch {
        // لا نوقف التطبيق إذا فشل DB
    }

    return {
        success: true,
        limit,
        remaining: limit - 1,
        resetAt,
    };
}

/**
 * Middleware helper: يُعيد Response جاهزاً إذا تجاوز الحد
 */
export async function withRateLimit(
    req: NextRequest,
    options: RateLimitOptions
): Promise<Response | null> {
    const result = await checkRateLimit(req, options);

    if (!result.success) {
        return new Response(
            JSON.stringify({
                error: 'تجاوزت الحد المسموح به من الطلبات. يرجى المحاولة لاحقاً.',
                retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': String(result.limit),
                    'X-RateLimit-Remaining': String(result.remaining),
                    'X-RateLimit-Reset': String(Math.floor(result.resetAt.getTime() / 1000)),
                    'Retry-After': String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)),
                },
            }
        );
    }

    return null;
}

/**
 * تنظيف Cache القديمة
 */
export function cleanupRateLimitCache(): void {
    const now = Date.now();
    for (const [key, value] of memCache.entries()) {
        if (value.resetAt <= now) memCache.delete(key);
    }
}
