// components/frontend/ArticleList.tsx
import { FrontendArticle } from '@/types/frontend';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
    articles: FrontendArticle[];
    title?: string;
}

export default function ArticleList({ articles, title = '最新文章' }: ArticleListProps) {
    return (
        <div>
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <a
                    href="/articles"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                >
                    <span>查看全部</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </div>

            {/* 文章卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article, index) => (
                    <ArticleCard key={article.id} article={article} index={index} />
                ))}
            </div>

            {/* 加载更多 */}
            <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                    加载更多文章
                </button>
            </div>
        </div>
    );
}