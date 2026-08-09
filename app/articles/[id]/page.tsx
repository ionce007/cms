// app/articles/[id]/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import { allArticles } from '@/data/articlesData';

export function generateStaticParams() {
    return allArticles.map((article) => ({
        id: article.id.toString(),
    }));
}

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
    const article = allArticles.find((a) => a.id === parseInt(params.id));

    if (!article) {
        notFound();
    }

    // 相关文章（同分类的前3篇）
    const relatedArticles = allArticles
        .filter((a) => a.categorySlug === article.categorySlug && a.id !== article.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 文章头部 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="max-w-4xl">
                            {/* 面包屑 */}
                            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                                <a href="/" className="hover:text-primary-600 transition-colors">首页</a>
                                <span>/</span>
                                <a href="/articles" className="hover:text-primary-600 transition-colors">文章</a>
                                <span>/</span>
                                <a href={`/categories/${article.categorySlug}`} className="hover:text-primary-600 transition-colors">
                                    {article.category}
                                </a>
                            </nav>

                            {/* 标题 */}
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                {article.title}
                            </h1>

                            {/* 元信息 */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={article.author.avatar}
                                        alt={article.author.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-gray-700 font-medium">{article.author.name}</span>
                                </div>
                                <span>•</span>
                                <span>{article.publishDate}</span>
                                <span>•</span>
                                <span>{article.readTime} 分钟阅读</span>
                                <span>•</span>
                                <span>{article.views.toLocaleString()} 次阅读</span>
                            </div>

                            {/* 标签 */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {article.tags.map((tag) => (
                                    <a
                                        key={tag}
                                        href={`/articles?tag=${tag}`}
                                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                    >
                                        #{tag}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 文章内容 */}
                        <div className="flex-1">
                            {/* 封面图 */}
                            <div className="mb-8 rounded-xl overflow-hidden">
                                <img
                                    src={article.coverImage}
                                    alt={article.title}
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* 文章正文 */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-lg leading-relaxed text-gray-700">
                                        {article.excerpt}
                                    </p>
                                    <p className="text-gray-600 leading-relaxed mt-4">
                                        这里是文章的详细内容。在实际项目中，这部分内容通常会从数据库或 CMS 中获取，
                                        可能包含 Markdown 格式的文本、代码块、图片等丰富的内容。
                                    </p>
                                    <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">章节标题</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        文章的主要内容区域，可以包含多个章节、代码示例、图表等。
                                        通过合适的排版和样式，让读者获得良好的阅读体验。
                                    </p>
                                    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 mt-4 overflow-x-auto">
                                        <code>{`// 代码示例
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`}</code>
                                    </pre>
                                </div>

                                {/* 点赞和分享 */}
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <button className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span>{article.likes}</span>
                                        </button>
                                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            <span>分享</span>
                                        </button>
                                    </div>
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        <span>收藏</span>
                                    </button>
                                </div>
                            </div>

                            {/* 相关文章 */}
                            {relatedArticles.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">相关文章</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {relatedArticles.map((related) => (
                                            <a
                                                key={related.id}
                                                href={`/articles/${related.id}`}
                                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group"
                                            >
                                                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                    {related.title}
                                                </h4>
                                                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                                                    <span>{related.publishDate}</span>
                                                    <span>•</span>
                                                    <span>{related.readTime} 分钟</span>
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