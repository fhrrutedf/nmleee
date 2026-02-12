/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/@:username',
                destination: '/creator/:username',
            },
            {
                source: '/@:username/:slug',
                destination: '/creator/:username/:slug',
            },
        ]
    },
}

module.exports = nextConfig
