// app/tags/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import ArticleCard from '@/components/frontend/ArticleCard';
import Sidebar from '@/components/frontend/Sidebar';
import { tags, allArticles } from '@/data/articlesData';

interface TagPageProps {
    params: Promise<{ slug: string }>;
}

// 生成元数据
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
    const { slug } = await params;
    const tag = tags.find(t => t.slug === slug);

    return {
        title: tag ? `#${tag.name} - 标签` : '标签未找到',
        description: tag ? `浏览与 ${tag.name} 相关的所有文章` : undefined,
    };
}

// 静态生成所有标签页面
export function generateStaticParams() {
    return tags.map(tag => ({
        slug: tag.slug,
    }));
}

export default async function TagDetailPage({ params }: TagPageProps) {
    const { slug } = await params;
    const tag = tags.find(t => t.slug === slug);

    if (!tag) {
        notFound();
    }

    // 获取包含该标签的所有文章
    const tagArticles = allArticles.filter(article =>
        article.tags.some(t => t.toLowerCase() === tag.name.toLowerCase())
    );

    // 相关标签（与这些文章相关的其他标签）
    const relatedTags = tags
        .filter(t => t.slug !== tag.slug)
        .filter(t =>
            tagArticles.some(article =>
                article.tags.some(articleTag =>
                    articleTag.toLowerCase() === t.name.toLowerCase()
                )
            )
        )
        .slice(0, 8);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 标签头部 */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        {/* 面包屑 */}
                        <nav className="flex items-center space-x-2 text-sm text-primary-200 mb-4">
                            <a href="/" className="hover:text-white transition-colors">首页</a>
                            <span>/</span>
                            <a href="/tags" className="hover:text-white transition-colors">标签</a>
                            <span>/</span>
                            <span className="text-white font-medium">#{tag.name}</span>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <span className="text-3xl font-bold">#</span>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold">{tag.name}</h1>
                                <p className="text-primary-200 mt-1">
                                    共 {tagArticles.length} 篇文章使用此标签
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 文章列表 */}
                        <div className="flex-1">
                            {tagArticles.length > 0 ? (
                                <>
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                                        带有 #{tag.name} 标签的文章
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {tagArticles.map((article, index) => (
                                            <ArticleCard key={article.id} article={article} index={index} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">🏷️</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        暂无文章
                                    </h3>
                                    <p className="text-gray-600">
                                        该标签下还没有文章
                                    </p>
                                </div>
                            )}

                            {/* 相关标签 */}
                            {relatedTags.length > 0 && (
                                <div className="mt-12">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">相关标签</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {relatedTags.map(t => (
                                            <a
                                                key={t.id}
                                                href={`/tags/${t.slug}`}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                            >
                                                #{t.name}
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