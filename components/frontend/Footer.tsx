// components/frontend/Footer.tsx
import { siteInfo, categories } from '@/data/frontendData';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        navigation: [
            { label: '首页', href: '/' },
            { label: '文章', href: '/articles' },
            { label: '分类', href: '/categories' },
            { label: '标签', href: '/tags' },
            { label: '关于', href: '/about' },
        ],
        resources: [
            { label: '帮助中心', href: '/help' },
            { label: '社区论坛', href: '/forum' },
            { label: 'RSS 订阅', href: '/rss' },
            { label: '站点地图', href: '/sitemap' },
        ],
        legal: [
            { label: '隐私政策', href: '/privacy' },
            { label: '服务条款', href: '/terms' },
            { label: 'Cookie 政策', href: '/cookies' },
        ],
    };

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* 品牌信息 */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">T</span>
                            </div>
                            <span className="text-lg font-bold text-white">
                                Tech<span className="text-primary-400">Blog</span>
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            {siteInfo.description}
                        </p>
                        {/* 社交链接 */}
                        <div className="flex items-center space-x-3">
                            {siteInfo.socialLinks.github && (
                                <a href={siteInfo.socialLinks.github} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="GitHub">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                            )}
                            <a href={siteInfo.socialLinks.twitter || '#'} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Twitter">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                            <a href={siteInfo.socialLinks.email || '#'} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Email">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* 导航链接 */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">导航</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.navigation.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 资源链接 */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">资源</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 法律链接 */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">法律</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 底部版权 */}
                <div className="mt-10 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-gray-500">
                            © {currentYear} {siteInfo.name}. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>❤️ 用爱发电</span>
                            <span className="text-gray-700">|</span>
                            <span>☕ 请我喝咖啡</span>
                            <span className="text-gray-700">|</span>
                            <span>🚀 由 Next.js 驱动</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}