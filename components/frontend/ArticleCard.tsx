// components/frontend/ArticleCard.tsx
'use client';

import Link from 'next/link';
import SafeImage from './SafeImage';
import { FrontendArticle1 } from '@/types/frontend';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
    article: FrontendArticle1;
    index?: number;
    /** ✅ 自定义文章链接前缀，例如 /category/frontend 或 /tag/react */
    linkPrefix?: string;
}

export default function ArticleCard({ article, index = 0, linkPrefix = '/articles' }: ArticleCardProps) {
    // ✅ 根据 linkPrefix 生成文章链接
    const articleUrl = `${linkPrefix}/${article.id}`;
    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300 group animate-slide-up'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* 封面图 */}
            <Link href={articleUrl} className="block relative overflow-hidden aspect-video">
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
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
                        {article.Category.name}
                    </span>
                </div>
                {article.featured && (
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-medium rounded-full shadow-sm">
                            🔥 精选
                        </span>
                    </div>
                )}
            </Link>

            {/* 内容 */}
            <div className="p-5">
                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.tags.slice(0, 3).map((tag) => (
                        <Link
                            key={tag.id}
                            href={`/tag/${tag.path}`}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                            #{tag.name}
                        </Link>
                    ))}
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    <Link href={articleUrl}>{article.title}</Link>
                </h3>

                {/* 摘要 */}
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {article.description}
                </p>

                {/* 底部 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
                        <span className="text-sm text-gray-600 font-medium">
                            {article.author.name}
                        </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span>{article.readTime}分钟</span>
                        <span>•</span>
                        <span>{article.pv.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}