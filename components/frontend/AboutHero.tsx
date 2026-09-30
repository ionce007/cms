// components/frontend/AboutHero.tsx
'use client'
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function AboutHero() {
    const { siteConfig } = useSiteConfig();  // ✅ 动态获取
    return (
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white">
            {/* 背景装饰 */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative max-w-3xl">
                    <div className="text-sm font-medium text-primary-300 mb-4 animate-slide-up">
                        {siteConfig.name}
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
                        {siteConfig.title}
                    </h1>
                    <p className="text-lg text-gray-300 leading-relaxed mb-8 animate-slide-up">
                        {siteConfig.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm animate-slide-up">
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">1000+</span>
                            <span className="text-gray-400">篇文章</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">10K+</span>
                            <span className="text-gray-400">注册用户</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">50K+</span>
                            <span className="text-gray-400">月访问量</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}