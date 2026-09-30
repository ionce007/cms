/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		unoptimized: process.env.NODE_ENV === 'development',
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'img.foryet.com',
				pathname: '/upload/**',
			},
			{
				protocol: 'https',
				hostname: 'blog.foryet.com',
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
