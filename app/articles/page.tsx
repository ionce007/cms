// app/articles/page.tsx
'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import ArticleCard from '@/components/frontend/ArticleCard';
import Sidebar from '@/components/frontend/Sidebar';
import ArticleFilters from '@/components/frontend/ArticleFilters';
import Pagination from '@/components/frontend/Pagination';
import { allArticles , categories, tags } from '@/data/articlesData';
import { ArticleFilters as FilterType } from '@/types/frontend';

const ITEMS_PER_PAGE = 6;

export default function ArticlesPage() {
    const [filters, setFilters] = useState<FilterType>({
        category: '',
        tag: '',
        sort: 'latest',
        search: '',
    });

    const [currentPage, setCurrentPage] = useState(1);

    // 筛选和排序文章
    const filteredArticles = useMemo(() => {
        let result = [...allArticles];

        // 搜索筛选
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(
                article =>
                    article.title.toLowerCase().includes(searchLower) ||
                    article.excerpt.toLowerCase().includes(searchLower) ||
                    article.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // 分类筛选
        if (filters.category) {
            result = result.filter(article => article.categorySlug === filters.category);
        }

        // 标签筛选
        if (filters.tag) {
            result = result.filter(article => article.tags.includes(filters.tag));
        }

        // 排序
        switch (filters.sort) {
            case 'popular':
                result.sort((a, b) => b.views - a.views);
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
                break;
            case 'latest':
            default:
                result.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
                break;
        }

        return result;
    }, [filters]);

    // 分页
    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // 重置页码当筛选条件改变时
    const handleFilterChange = (newFilters: FilterType) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            所有文章
                        </h1>
                        <p className="text-gray-600">
                            共 {filteredArticles.length} 篇文章
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 左侧主内容 */}
                        <div className="flex-1">
                            {/* 筛选组件 */}
                            <ArticleFilters
                                filters={filters}
                                categories={categories}
                                tags={tags}
                                onFilterChange={handleFilterChange}
                            />

                            {/* 文章列表 */}
                            {paginatedArticles.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        {paginatedArticles.map((article, index) => (
                                            <ArticleCard key={article.id} article={article} index={index} />
                                        ))}
                                    </div>

                                    {/* 分页 */}
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        未找到相关文章
                                    </h3>
                                    <p className="text-gray-600">
                                        尝试调整筛选条件或搜索关键词
                                    </p>
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