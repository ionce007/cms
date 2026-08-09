import { ArticleCardProps } from '@/types';
import { cn, formatNumber } from '@/lib/utils';

export default function ArticleCard({ article }: ArticleCardProps) {
    const statusConfig = {
        published: { bg: 'bg-success-50 text-success-600', label: '已发布' },
        draft: { bg: 'bg-warning-50 text-warning-600', label: '草稿' },
        archived: { bg: 'bg-gray-50 text-gray-600', label: '已归档' },
    };

    const status = statusConfig[article.status];

    return (
        <div className="p-4 border border-gray-200 rounded-xl card-hover cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
                    {article.title}
                </h3>
                <span className={cn('badge ml-2 whitespace-nowrap', status.bg)}>
                    {status.label}
                </span>
            </div>

            {article.excerpt && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                </p>
            )}

            {article.tags && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center ring-2 ring-white">
                        <span className="text-primary-600 text-xs font-medium">
                            {article.author[0]}
                        </span>
                    </div>
                    <span className="font-medium text-gray-700">{article.author}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400">{article.category}</span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{formatNumber(article.views)}</span>
                    </span>
                    {article.readTime && (
                        <span>{article.readTime}分钟阅读</span>
                    )}
                    <span className="text-gray-400">{article.date}</span>
                </div>
            </div>
        </div>
    );
}