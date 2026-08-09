/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    experimental: {
        optimizePackageImports: ['@heroicons/react'],
    },
};

module.exports = nextConfig;