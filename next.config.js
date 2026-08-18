/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: process.env.NODE_ENV === 'development',
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'example.com',
                port: '', // 可选，默认空
                pathname: '/images/**', // 可选，限制路径
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            }
        ]
    },
    experimental: {
        optimizePackageImports: ['@heroicons/react'],
    },
};

module.exports = nextConfig;