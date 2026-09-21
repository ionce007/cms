// app/articles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import ArticleCard from '@/components/frontend/ArticleCard';
import ArticleListItem from '@/components/frontend/ArticleListItem';
import ViewToggle, { ViewMode } from '@/components/frontend/ViewToggle';
import Sidebar from '@/components/frontend/Sidebar';
import ArticleFilters from '@/components/frontend/ArticleFilters';
import Pagination from '@/components/frontend/Pagination';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import { useSidebarData } from '@/hooks/useCommonData';
import { ArticleFilters as FilterType, FrontendArticle1 } from '@/types/frontend';

const ITEMS_PER_PAGE = 6;
const baseUrl = process.env.API_URL || 'https://blog.foryet.com/api';

export default function ArticlesPage() {
    // ✅ 使用 SWR Hook 获取侧边栏数据 + 进度
    const { progress, loadingMessage, loadingStates, isAllLoaded, categories, tags } = useSidebarData();

    const [filters, setFilters] = useState<FilterType>({
        category: '',
        tag: '',
        sort: 'latest',
        search: '',
        page: 1,
        limit: ITEMS_PER_PAGE,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // 文章列表数据
    const [paginatedArticles, setPaginatedArticles] = useState<FrontendArticle1[]>([]);
    const [totalArticles, setTotalArticles] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [articlesLoading, setArticlesLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    // 从 URL 读取搜索参数
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const search = searchParams.get('search') || '';
        setSearchTerm(search);
    }, []);

    // 加载文章列表
    useEffect(() => {
        async function fetchArticles() {
            setArticlesLoading(true);
            try {
                const params = {
                    ...filters,
                    search: searchTerm || filters.search,
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                };
                const response = await fetch(`${baseUrl}/articles/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(params),
                });

                const data = await response.json();

                if (data && data.code === 1) {
                    setPaginatedArticles(data.data || []);
                    const count = data.count || 0;
                    setTotalArticles(count);
                    setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
                } else {
                    setPaginatedArticles([]);
                    setTotalArticles(0);
                    setTotalPages(0);
                }
            } catch (err) {
                console.error('获取文章失败:', err);
                if (err instanceof Error) setError(err.message);
            } finally {
                setArticlesLoading(false);
            }
        }

        fetchArticles();
    }, [currentPage, filters, searchTerm]);

    // ✅ 整体加载状态 = 侧边栏加载 + 文章加载
    const isOverallLoading = !isAllLoaded || articlesLoading;

    // 从 localStorage 读取视图偏好
    useEffect(() => {
        const savedViewMode = localStorage.getItem('articles-view-mode') as ViewMode;
        if (savedViewMode === 'grid' || savedViewMode === 'list') {
            setViewMode(savedViewMode);
        }
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('articles-view-mode', mode);
    };

    const handleFilterChange = (newFilters: FilterType) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (error) {
        return (
            <div className="min-h-screen text-center bg-gray-50 flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            所有文章
                        </h1>
                        <p className="text-gray-600">共 {totalArticles} 篇文章</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    {isOverallLoading ? (
                        /* ========== 加载中 ========== */
                        <div>
                            {/* ✅ 进度显示 - 使用 SWR 提供的真实进度 */}
                            <LoadingProgress
                                progress={progress}
                                loadingMessage={loadingMessage}
                                loadingStates={loadingStates}
                            />

                            {/* 骨架屏 */}
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 min-w-0">
                                    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 mb-6">
                                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map((item) => (
                                            <div key={item} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <div className="aspect-video bg-gray-200 animate-pulse" />
                                                <div className="p-5 space-y-3">
                                                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full lg:w-80 flex-shrink-0">
                                    <div className="space-y-6">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="bg-white rounded-xl border border-gray-200 p-5">
                                                <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ========== 正常内容 ========== */
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 min-w-0">
                                {/* 筛选 + 视图切换在同一行 */}
                                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                    <div className="flex-1">
                                        <ArticleFilters
                                            filters={filters}
                                            categories={categories}
                                            tags={tags}
                                            onFilterChange={handleFilterChange}
                                        />
                                    </div>
                                    <div className="flex-shrink-0 sm:mt-2">
                                        <ViewToggle
                                            viewMode={viewMode}
                                            onViewModeChange={handleViewModeChange}
                                        />
                                    </div>
                                </div>

                                {paginatedArticles.length > 0 ? (
                                    <>
                                        {viewMode === 'grid' ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                {paginatedArticles.map((article, index) => (
                                                    <ArticleCard key={index + 1} article={article} index={index} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4 mt-6">
                                                {paginatedArticles.map((article, index) => (
                                                    <ArticleListItem key={article.id} article={article} index={index} />
                                                ))}
                                            </div>
                                        )}

                                        {totalPages > 1 && (
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            未找到相关文章
                                        </h3>
                                        <p className="text-gray-600">尝试调整筛选条件或搜索关键词</p>
                                    </div>
                                )}
                            </div>

                            <div className="w-full lg:w-80 flex-shrink-0">
                                {/* ✅ Sidebar 自动使用 SWR 数据 */}
                                <Sidebar />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}