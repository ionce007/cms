// components/frontend/ArticleListItem.tsx
'use client';

import Link from 'next/link';
import CoverImage from './CoverImage';
import { FrontendArticle } from '@/types/frontend';
import { cn } from '@/lib/utils';

interface ArticleListItemProps {
    article: FrontendArticle;
    index?: number;
    linkPrefix?: string;
}

export default function ArticleListItem({
    article,
    index = 0,
    linkPrefix = '/articles',
}: ArticleListItemProps) {
    const articleUrl = `${linkPrefix}/${article.id}`;

    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300 group',
                'animate-slide-up'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* ✅ 关键：items-stretch 让子元素高度一致 */}
            <div className="flex flex-row items-stretch">
                {/* ✅ 封面图：只固定宽度，高度自动撑满 */}
                <Link
                    href={articleUrl}
                    className="relative flex-shrink-0 overflow-hidden bg-gray-100
                        w-24 sm:w-32 md:w-36 lg:w-40"
                >
                    <CoverImage
                        src={article.img}
                        alt={article.title}
                        aspectRatio="fill"
                        objectFit="cover"
                        useBlurBackground={false}
                        fallbackIcon="📄"
                        className="w-full h-full"
                    />
                </Link>

                {/* ✅ 内容区 */}
                <div className="flex-1 p-3 sm:p-5 flex flex-col min-w-0">
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
                        {(article.Tags || []).slice(0, 3).map((tag) => (
                            <Link
                                key={tag.id || tag.name}
                                href={`/tag/${tag.path || tag.name.toLowerCase()}`}
                                className="px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                    </div>

                    {/* 标题 */}
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-1.5 sm:mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        <Link href={articleUrl}>{article.title}</Link>
                    </h3>

                    {/* 摘要 */}
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2 mb-3 leading-relaxed flex-1">
                        {article.description || ''}
                    </p>

                    {/* 底部信息 */}
                    <div className="flex items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-gray-100 mt-auto">
                        {/* 作者 */}
                        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-shrink-0">
                            <img
                                src={article.author?.avatar || '/img/avatar-default.png'}
                                alt={article.author?.name || '匿名'}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-2 ring-white flex-shrink-0"
                            />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-700 truncate max-w-[60px] sm:max-w-[80px]">
                                {article.author?.name || '匿名'}
                            </span>
                        </div>

                        {/* 统计信息 */}
                        <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                            {/* 阅读时长 */}
                            <span className="hidden sm:flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{article.readTime || 0}分钟</span>
                            </span>

                            {/* 浏览量 */}
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{article.pv || 0}</span>
                            </span>

                            {/* 点赞 */}
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={ article.isLiked ? "currentColor" : "none" } viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{article.likes || 0}</span>
                            </span>

                            {/* 收藏 */}
                            <span className="hidden sm:flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={ article.isBookmarked ? "currentColor" : "none" } viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                                <span>{article.marked || 0}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}