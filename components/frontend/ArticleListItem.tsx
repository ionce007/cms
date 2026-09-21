// components/frontend/ArticleListItem.tsx
'use client';

import Link from 'next/link';
import { FrontendArticle1 } from '@/types/frontend';
import { cn } from '@/lib/utils';
import SafeImage from './SafeImage';

interface ArticleListItemProps {
    article: FrontendArticle1;
    index?: number;
    linkPrefix?: string;  // ✅ 新增
}

export default function ArticleListItem({ article, index = 0, linkPrefix = '/articles' }: ArticleListItemProps) {
    const articleUrl = `${linkPrefix}/${article.id}`;

    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300 group animate-slide-up'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex flex-col sm:flex-row">
                {/* 左侧缩略图 */}
                <Link
                    href={articleUrl}
                    className="relative sm:w-64 lg:w-72 flex-shrink-0 overflow-hidden"
                >
                    <div className="aspect-video sm:aspect-auto sm:h-full min-h-[160px]">
                        {/*<img
                            src={article.img}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />*/}
                        <SafeImage
                            src={article.img}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
                            {article.Category.name}
                        </span>
                    </div>
                </Link>

                {/* 右侧内容 */}
                <div className="flex-1 p-5 flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {article.tags.slice(0, 4).map((tag) => (
                            <Link
                                key={tag.id}
                                href={`/tag/${tag.path.toLowerCase()}`}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        <Link href={articleUrl}>{article.title}</Link>
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                        {article.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                            {/*<img
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="w-7 h-7 rounded-full ring-2 ring-white"
                            />*/}
                            <SafeImage
                                src={article.author.avatar}
                                alt={article.author.name}
                                className="w-7 h-7 rounded-full ring-2 ring-white"
                            />
                            <div>
                                <div className="text-sm text-gray-700 font-medium leading-tight">
                                    {article.author.name}
                                </div>
                                <div className="text-xs text-gray-400 leading-tight">
                                    {article.createdAt.substring(0, 10)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>{article.readTime} 分钟</span>
                            <span>{article.pv.toLocaleString()} 阅读</span>
                            <span>{article.likes} 点赞</span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}