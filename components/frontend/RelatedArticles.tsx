// components/frontend/RelatedArticles.tsx
import { FrontendArticle } from '@/types/frontend';

interface RelatedArticlesProps {
    articles: FrontendArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
    if (articles.length === 0) return null;

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">相关文章</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {articles.map((article) => (
                    <a
                        key={article.id}
                        href={`/articles/${article.id}`}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                        <div className="aspect-video overflow-hidden">
                            <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        </div>
                        <div className="p-4">
                            <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                                {article.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                                <span>{article.publishDate}</span>
                                <span>•</span>
                                <span>{article.readTime} 分钟</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}