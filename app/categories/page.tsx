// app/categories/page.tsx
import { Metadata } from 'next';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import CategoryCard from '@/components/frontend/CategoryCard';
import Sidebar from '@/components/frontend/Sidebar';
import { categories } from '@/data/articlesData';
import { allArticles } from '@/data/articlesData';

export const metadata: Metadata = {
    title: '文章分类',
    description: '浏览所有文章分类，找到你感兴趣的内容',
};

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            文章分类
                        </h1>
                        <p className="text-gray-600">
                            共 {categories.length} 个分类，浏览你感兴趣的主题
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 分类卡片网格 */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((category, index) => {
                                    // 计算每个分类的实际文章数
                                    const articleCount = allArticles.filter(
                                        article => article.categorySlug === category.slug
                                    ).length;

                                    return (
                                        <CategoryCard
                                            key={category.id}
                                            category={category}
                                            articleCount={articleCount}
                                            index={index}
                                        />
                                    );
                                })}
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