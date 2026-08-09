// components/frontend/ArticleCard.tsx
import { FrontendArticle } from '@/types/frontend';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
    article: FrontendArticle;
    index?: number;
}

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 group',
                'animate-slide-up'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* 封面图 */}
            <a href={`/article/${article.id}`} className="block relative overflow-hidden aspect-video">
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
                        {article.category}
                    </span>
                </div>
                {article.featured && (
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-medium rounded-full shadow-sm">
                            🔥 精选
                        </span>
                    </div>
                )}
            </a>

            {/* 内容 */}
            <div className="p-5">
                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.tags.slice(0, 3).map((tag) => (
                        <a
                            key={tag}
                            href={`/tags/${tag}`}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                            #{tag}
                        </a>
                    ))}
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    <a href={`/article/${article.id}`}>
                        {article.title}
                    </a>
                </h3>

                {/* 摘要 */}
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {article.excerpt}
                </p>

                {/* 底部元信息 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {/* 作者信息 */}
                    <div className="flex items-center space-x-2">
                        <img
                            src={article.author.avatar}
                            alt={article.author.name}
                            className="w-7 h-7 rounded-full ring-2 ring-white"
                        />
                        <span className="text-sm text-gray-600 font-medium">{article.author.name}</span>
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span className="flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{article.readTime}分钟</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{article.views.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{article.likes}</span>
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}