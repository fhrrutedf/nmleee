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
        return [
            {
                source: "/api/webhooks/sms",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
                ],
            },
            {
                // Security headers لجميع الصفحات
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "SAMEORIGIN" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
