// components/frontend/ArticleDetailView.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArticleContent from './ArticleContent';
import ShareButtons from './ShareButtons';
import ArticleBreadcrumb from './ArticleBreadcrumb';
import { FrontendArticle1 } from '@/types/frontend';
import { cn } from '@/lib/utils';
import SafeImage from './SafeImage';

interface ArticleDetailViewProps {
    article: FrontendArticle1;
    relatedArticles?: FrontendArticle1[];  // ✅ 新增
    breadcrumbItems?: { label: string; href?: string; icon?: string }[];
    backLink?: { label: string; href: string };
    /** 关联文章的链接前缀（分类/标签页传入） */
    relatedLinkPrefix?: string;
}

export default function ArticleDetailView({
    article,
    relatedArticles = [],
    breadcrumbItems,
    backLink,
    relatedLinkPrefix = '/articles',
}: ArticleDetailViewProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    return (
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 面包屑 */}
            {breadcrumbItems && breadcrumbItems.length > 0 && (
                <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                    <ArticleBreadcrumb items={breadcrumbItems} />
                </div>
            )}

            {/* 返回按钮 */}
            {backLink && (
                <div className="px-6 pt-4">
                    <Link
                        href={backLink.href}
                        className="inline-flex items-center space-x-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>返回{backLink.label}</span>
                    </Link>
                </div>
            )}

            {/* 封面图 */}
            <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden mt-4">
                {/*<img
                    src={article.img}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />*/}
                <SafeImage
                    src={article.img}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                        {article.Category && (
                            <Link
                                href={`/category/${article.Category.path}`}
                                className="px-3 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full hover:bg-white transition-colors"
                            >
                                {article.Category.name}
                            </Link>
                        )}
                        {article.featured && (
                            <span className="px-3 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-medium rounded-full">
                                🔥 精选
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* 元信息 */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    {/*<img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
                    />*/}
                    <SafeImage
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
                    />
                    <div>
                        <div className="text-sm font-medium text-gray-800">
                            {article.author.name}
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{article.readTime} 分钟阅读</span>
                    <span>•</span>
                    <span>{article.pv.toLocaleString()} 次阅读</span>
                    <span>•</span>
                    <span>{article.likes} 点赞</span>
                </div>
            </div>

            {/* 正文 */}
            <div className="px-6 py-8">
                <ArticleContent content={article.content} />

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                    {article.tags.map((tag) => (
                        <Link
                            key={tag.id}
                            href={`/tags/${tag.path.toLowerCase()}`}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                            #{tag.name}
                        </Link>
                    ))}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={cn(
                                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                                isLiked
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{article.likes + (isLiked ? 1 : 0)}</span>
                        </button>

                        <button
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={cn(
                                'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                                isBookmarked
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                        >
                            <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span>收藏</span>
                        </button>
                    </div>

                    <ShareButtons
                        title={article.title}
                        url={`/articles/${article.id}`}
                    />
                </div>
            </div>

            {/* ✅ 关联文章 */}
            {relatedArticles && relatedArticles.length > 0 && (
                <div className="px-6 py-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🔗</span>
                        相关文章
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {relatedArticles.map((item) => {
                            const url = `${relatedLinkPrefix}/${item.id}`;
                            return (
                                <Link
                                    key={item.id}
                                    href={url}
                                    className="group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-all"
                                >
                                    <div className="aspect-video overflow-hidden">
                                        {/*<img
                                            src={item.img}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />*/}
                                        <SafeImage
                                            src={article.img}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>{item.readTime} 分钟</span>
                                            <span>{item.pv.toLocaleString()} 阅读</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </article>
    );
}