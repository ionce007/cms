/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		unoptimized: process.env.NODE_ENV === 'development',
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'example.com',
				pathname: '/images/**',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '/**',
			},
		],
	},
	experimental: {
		optimizePackageImports: ['@heroicons/react'],
	},
	agentRules: false,
    reactStrictMode: false,  // 临时关闭测试
};

module.exports = nextConfig;
