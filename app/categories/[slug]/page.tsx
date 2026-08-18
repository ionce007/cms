// app/categories/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import ArticleCard from '@/components/frontend/ArticleCard';
import Sidebar from '@/components/frontend/Sidebar';
import { categories, allArticles } from '@/data/articlesData';

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

// 生成元数据
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = categories.find(c => c.slug === slug);

    return {
        title: category ? `${category.name} - 文章分类` : '分类未找到',
        description: category ? `浏览${category.name}相关的所有文章` : undefined,
    };
}

// 静态生成所有分类页面
export function generateStaticParams() {
    return categories.map(category => ({
        slug: category.slug,
    }));
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    const category = categories.find(c => c.slug === slug);

    if (!category) {
        notFound();
    }

    // 获取该分类下的所有文章
    const categoryArticles = allArticles.filter(
        article => article.categorySlug === slug
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 分类头部 */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        {/* 面包屑 */}
                        <nav className="flex items-center space-x-2 text-sm text-primary-200 mb-4">
                            <a href="/" className="hover:text-white transition-colors">首页</a>
                            <span>/</span>
                            <a href="/categories" className="hover:text-white transition-colors">分类</a>
                            <span>/</span>
                            <span className="text-white font-medium">{category.name}</span>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                                {category.icon}
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold">{category.name}</h1>
                                <p className="text-primary-200 mt-1">
                                    共 {categoryArticles.length} 篇文章
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 文章列表 */}
                        <div className="flex-1">
                            {categoryArticles.length > 0 ? (
                                <>
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                                        {category.name} 下的文章
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {categoryArticles.map((article, index) => (
                                            <ArticleCard key={article.id} article={article} index={index} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">📂</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        暂无文章
                                    </h3>
                                    <p className="text-gray-600">
                                        该分类下还没有发布文章
                                    </p>
                                </div>
                            )}

                            {/* 其他分类 */}
                            <div className="mt-12">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">浏览其他分类</h3>
                                <div className="flex flex-wrap gap-2">
                                    {categories
                                        .filter(c => c.slug !== category.slug)
                                        .map(c => (
                                            <a
                                                key={c.id}
                                                href={`/categories/${c.slug}`}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50 transition-all"
                                            >
                                                {c.icon} {c.name}
                                            </a>
                                        ))}
                                </div>
                            </div>
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