/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'via.placeholder.com' },
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: '**.supabase.co' },
        ],
    },
    async rewrites() {
        return [
            { source: '/@:username', destination: '/creator/:username' },
            { source: '/@:username/:slug', destination: '/creator/:username/:slug' },
        ];
    },
    async headers() {
        // ── Content Security Policy ──────────────────────────────────
        const csp = [
            "default-src 'self'",
            // السكربتات: self + Supabase + Google + Next.js HMR
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://accounts.google.com https://www.googletagmanager.com https://www.google-analytics.com",
            // الأنماط
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            // الخطوط
            "font-src 'self' data: https://fonts.gstatic.com",
            // الصور: self + CDNs المستخدمة
            "img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com https://images.unsplash.com https://via.placeholder.com https://ik.imagekit.io https://lh3.googleusercontent.com",
            // الاتصالات: self + Supabase + APIs خارجية
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.resend.com https://ipapi.co https://api.oxapay.com",
            // الإطارات: self فقط (Bunny player)
            "frame-src 'self' https://*.bunny.net https://iframe.mediadelivery.net https://accounts.google.com",
            // الميديا
            "media-src 'self' https://*.supabase.co https://*.bunny.net https://iframe.mediadelivery.net",
            // الـ Workers
            "worker-src 'self' blob:",
            // منع جميع التضمينات من مواقع أخرى (Clickjacking)
            "frame-ancestors 'self'",
        ].join('; ');

        return [
            // ── Webhook SMS endpoint ─────────────────────────────────
            {
                source: "/api/webhooks/sms",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
                ],
            },
            // ── Security Headers لجميع الصفحات ───────────────────────
            {
                source: "/(.*)",
                headers: [
                    // منع sniffing نوع المحتوى
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    // منع Clickjacking — إطارات من نفس الأصل فقط
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    // حماية XSS القديمة (للمتصفحات القديمة)
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    // إخفاء URL الكامل عند الانتقال لمواقع خارجية
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    // HSTS: إجبار HTTPS لمدة سنتين + subdomains + preload
                    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
                    // منع FLoC / Topics API
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
                    // Content Security Policy
                    { key: "Content-Security-Policy", value: csp },
                ],
            },
        ];
    },
    // ملاحظة: التحويلات من UUID إلى Slug تعمل تلقائياً في صفحات المنتج والكورس
    // لأن كلاهما يبحث عبر: OR [{ slug }, { id: slug }]
    // إذا أردت redirects صريحة لروابط معروفة، أضفها هنا:
    // async redirects() { return [ { source: '/product/UUID', destination: '/product/SLUG', permanent: true } ] }
};

module.exports = nextConfig;
