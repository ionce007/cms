// app/articles/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import ArticleContent from '@/components/frontend/ArticleContent';
import ShareButtons from '@/components/frontend/ShareButtons';
import { getArticleDetail, getRelatedArticles } from '@/data/articleDetailData';

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

// 生成元数据
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { id } = await params;
    const article = getArticleDetail(Number(id));

    return {
        title: article ? article.title : '文章未找到',
        description: article?.excerpt,
    };
}

// 页面组件
export default async function ArticleDetailPage({ params }: ArticlePageProps) {
    const { id } = await params;
    const articleId = Number(id);
    const article = getArticleDetail(articleId);

    if (!article) {
        notFound();
    }

    const relatedArticles = getRelatedArticles(articleId, article.categorySlug);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* 面包屑导航 */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                        <a href="/" className="hover:text-primary-600 transition-colors">首页</a>
                        <span>/</span>
                        <a href="/articles" className="hover:text-primary-600 transition-colors">文章</a>
                        <span>/</span>
                        <a href={`/categories/${article.categorySlug}`} className="hover:text-primary-600 transition-colors">
                            {article.category}
                        </a>
                        <span>/</span>
                        <span className="text-gray-800 font-medium truncate max-w-[200px]">
                            {article.title}
                        </span>
                    </nav>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 文章主体 */}
                        <div className="flex-1 min-w-0">
                            <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {/* 封面图 */}
                                <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    {/* 封面上的分类和标题 */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <a
                                                href={`/categories/${article.categorySlug}`}
                                                className="px-3 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full hover:bg-white transition-colors"
                                            >
                                                {article.category}
                                            </a>
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

                                {/* 文章元信息 */}
                                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={article.avatar}
                                            alt={article.author}
                                            className="w-10 h-10 rounded-full ring-2 ring-white shadow-sm"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-800">{article.author}</div>
                                            <div className="text-xs text-gray-500">{article.publishDate}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{article.readTime} 分钟阅读</span>
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>{article.views.toLocaleString()} 次阅读</span>
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            <span>{article.comments.length} 条评论</span>
                                        </span>
                                    </div>
                                </div>

                                {/* 文章正文 */}
                                <div className="px-6 py-8">
                                    <ArticleContent content={article.content} />

                                    {/* 标签 */}
                                    <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                                        {article.tags.map((tag) => (
                                            <a
                                                key={tag}
                                                href={`/tags/${tag.toLowerCase()}`}
                                                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            >
                                                #{tag}
                                            </a>
                                        ))}
                                    </div>

                                    {/* 分享按钮 */}
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                        <div className="text-sm text-gray-500">
                                            觉得有用？分享给更多人
                                        </div>
                                        <ShareButtons title={article.title} url={`/articles/${article.id}`} />
                                    </div>
                                </div>
                            </article>

                            {/* 评论区 */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">
                                    评论 ({article.comments.length})
                                </h3>

                                {article.comments.length > 0 ? (
                                    <div className="space-y-6">
                                        {article.comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <img
                                                    src={comment.avatar}
                                                    alt={comment.author}
                                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium text-gray-800">{comment.author}</span>
                                                        <span className="text-xs text-gray-400">{comment.date}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{comment.content}</p>
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                                            点赞 ({comment.likes})
                                                        </button>
                                                        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                                            回复
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">暂无评论，来抢沙发吧～</p>
                                )}
                            </div>

                            {/* 相关文章 */}
                            {relatedArticles.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">相关文章</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {relatedArticles.map((item) => (
                                            <a
                                                key={item.id}
                                                href={`/articles/${item.id}`}
                                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
                                            >
                                                <div className="aspect-video overflow-hidden">
                                                    <img
                                                        src={item.coverImage}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                                                        <span>{item.publishDate}</span>
                                                        <span>•</span>
                                                        <span>{item.readTime} 分钟</span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 右侧边栏 */}
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}