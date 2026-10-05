// components/frontend/Footer.tsx
'use client';

import { useSiteConfig } from '@/hooks/useSiteConfig';
import { NAV_ITEMS, SITE_RESOURCES, LEGAL_DECLARATIONS, FRIENDLY_LINKS } from '@/config/navigation';
import { DEFAULT_SITE_CONFIG } from '@/config/site';

interface FriendLink {
    label: string;
    href: string;
    icon?: string;
    description?: string;
}

export default function Footer() {
    const { siteConfig } = useSiteConfig();
    const currentYear = new Date().getFullYear();
    const extInfo = siteConfig.json || DEFAULT_SITE_CONFIG.json;
    const icpUrl = process.env.NEXT_PUBLIC_ICP_URL || 'https://beian.miit.gov.cn/#/Integrated/index';
    
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
                {/* ✅ 品牌信息 - 独占一行 */}
                {/*<div className="mb-6 sm:mb-8 pb-6 border-b border-gray-800 lg:border-b-0 lg:pb-0">
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                {extInfo.logo}
                            </span>
                        </div>
                        <span className="text-lg font-bold text-white">
                            {siteConfig.name}
                        </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3 max-w-md">
                        {siteConfig.description}
                    </p>

                    <div className="flex items-center space-x-2">
                        {extInfo.github && (
                            <a
                                href={extInfo.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                aria-label="GitHub"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        )}
                        {extInfo.email && (
                            <a
                                href={extInfo.email}
                                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                aria-label="Email"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </a>
                        )}
                        <a
                            href="/rss.xml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
                            aria-label="RSS 订阅"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                            </svg>
                        </a>
                    </div>
                </div>*/}

                {/* ✅ 四列并排（手机端）→ 桌面端 6 列 */}
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6 lg:gap-8">
                    {/* 导航 */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-4 whitespace-nowrap">
                            导航
                        </h3>
                        <ul className="space-y-1.5 sm:space-y-2.5">
                            {NAV_ITEMS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors break-words"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 资源 */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-4 whitespace-nowrap">
                            资源
                        </h3>
                        <ul className="space-y-1.5 sm:space-y-2.5">
                            {SITE_RESOURCES.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        target={link.external ? '_blank' : undefined}
                                        rel={link.external ? 'noopener noreferrer' : undefined}
                                        className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors break-words"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 友情链接 */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-4 whitespace-nowrap">
                            友链
                        </h3>
                        <ul className="space-y-1.5 sm:space-y-2.5">
                            {FRIENDLY_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors break-words"
                                        title={link.title}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 法律 */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-4 whitespace-nowrap">
                            法律
                        </h3>
                        <ul className="space-y-1.5 sm:space-y-2.5">
                            {LEGAL_DECLARATIONS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors break-words"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ✅ 桌面端额外两列：品牌信息（占位） */}
                    <div className="hidden lg:block lg:col-span-2 lg:order-first">
                        {/* 品牌信息在桌面端显示在左侧 */}
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {extInfo.logo}
                                </span>
                            </div>
                            <span className="text-lg font-bold text-white">
                                {siteConfig.name}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-md">
                            {siteConfig.description}
                        </p>
                        <div className="flex items-center space-x-2">
                            {extInfo.github && (
                                <a
                                    href={extInfo.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                    aria-label="GitHub"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                            )}
                            <a
                                href="/rss.xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:bg-orange-500 hover:text-white transition-colors"
                                aria-label="RSS 订阅"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* ✅ 底部版权 */}
                <div className="mt-6 sm:mt-10 pt-4 sm:pt-8 border-t border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <p className="text-[10px] sm:text-sm text-gray-500 text-center sm:text-left">
                            © {currentYear} {siteConfig.name}. All rights reserved.  {siteConfig.icp && (
                                <a
                                    href={icpUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-orange-400 transition-colors ml-4"
                                >
                                    {siteConfig.icp}
                                </a>
                            )}
                        </p>
                        <div className="flex items-center space-x-3 text-[10px] sm:text-sm text-gray-500">
                            <a
                                href="/rss.xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-orange-400 transition-colors flex items-center space-x-1"
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                                </svg>
                                <span>RSS</span>
                            </a>
                            <span className="text-gray-700">|</span>
                            <a
                                href="/sitemap.xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary-400 transition-colors"
                            >
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}