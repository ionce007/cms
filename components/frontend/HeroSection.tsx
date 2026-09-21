// components/frontend/HeroSection.tsx
import { FrontendArticle1 } from '@/types/frontend';
import SafeImage from './SafeImage';

interface HeroSectionProps {
    article?: FrontendArticle1 | null;
}

export default function HeroSection({ article }: HeroSectionProps) {
    if (!article) {
        return null;
    }
    return (
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                <div className="max-w-3xl">
                    {/* 标签 */}
                    <div className="flex items-center space-x-2 mb-4 animate-slide-up">
                        <span className="px-3 py-1 bg-primary-500/20 text-primary-200 text-xs font-medium rounded-full border border-primary-400/30">
                            {article.Category.name}
                        </span>
                        {article.featured && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 text-xs font-medium rounded-full border border-yellow-400/30">
                                🔥 精选文章
                            </span>
                        )}
                    </div>

                    {/* 标题 */}
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 animate-slide-up">
                        <a href={`/article/${article.id}`} className="hover:text-primary-300 transition-colors">
                            {article.title}
                        </a>
                    </h1>

                    {/* 摘要 */}
                    <p className="text-lg text-gray-300 line-clamp-2 leading-relaxed mb-8 animate-slide-up">
                        {article.description }
                    </p>

                    {/* 作者和元信息 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 animate-slide-up">
                        <div className="flex items-center space-x-2">
                            {/*<img
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="w-8 h-8 rounded-full ring-2 ring-white/20"
                            />*/}
                            <SafeImage
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="w-8 h-8 rounded-full ring-2 ring-white/20"
                            />
                            <span className="text-gray-200 font-medium">{article.author.name}</span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span>{article.createdAt.substring(0, 10)}</span>
                        <span className="text-gray-500">•</span>
                        <span>{article.readTime} 分钟阅读</span>
                        <span className="text-gray-500">•</span>
                        <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{article.pv.toLocaleString()} 次阅读</span>
                        </span>
                    </div>

                    {/* CTA 按钮 */}
                    <div className="mt-8 animate-slide-up">
                        <a
                            href={`/articles/${article.id}`}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 transition-colors shadow-lg hover:shadow-xl"
                        >
                            <span>阅读全文</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}