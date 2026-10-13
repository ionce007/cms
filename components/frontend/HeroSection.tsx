// components/frontend/HeroSection.tsx
import { FrontendArticle } from '@/types/frontend';
import SafeImage from './SafeImage';
import { calcReadTime } from '@/lib/utils';

interface HeroSectionProps {
    article?: FrontendArticle | null;
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
                        {article.description}
                    </p>

                    {/* 作者和元信息 */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 animate-slide-up">
                        <div className="flex items-center space-x-2">
                            <SafeImage
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="w-8 h-8 rounded-full ring-2 ring-white/20"
                            />
                            <span className="text-gray-200 font-medium">{article.author.name}</span>
                        </div>
                        <span className="text-gray-500">•</span>
                        <span>{article.createdAt.substring(0, 10)}</span>
                        {/*<span><span className="text-gray-500 mr-1">🕒</span>{calcReadTime(article.content)} 分钟阅读</span>
                        <span className="flex items-center space-x-1">
                            <span><span className="text-gray-500 mr-1">👁️</span>{article.pv} 次阅读</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <span><span className="text-gray-500 mr-1">👍</span>{article.likes ? article.likes : 0} 次点赞</span>
                        </span>*/}
                        {/* 阅读时长 */}
                        <span className="flex items-center space-x-1 whitespace-nowrap">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{article.readTime || 0}分钟</span>
                        </span>

                        {/* 浏览量 */}
                        <span className="flex items-center space-x-1 whitespace-nowrap">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{article.pv || 0}</span>
                        </span>

                        {/* 点赞数 */}
                        <span className="flex items-center space-x-1 whitespace-nowrap">
                            <svg className="w-3.5 h-3.5" fill={article.isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{article.likes || 0}</span>
                        </span>

                        {/* 收藏数 */}
                        <span className="flex items-center space-x-1 whitespace-nowrap">
                            <svg className="w-3.5 h-3.5" fill={article.isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                            <span>{article.marked || 0}</span>
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