// app/category/[slug]/CategoryClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import ArticleCard from '@/components/frontend/ArticleCard';
import ArticleListItem from '@/components/frontend/ArticleListItem';
import ViewToggle, { ViewMode } from '@/components/frontend/ViewToggle';
import SortDropdown, { SortOption } from '@/components/frontend/SortDropdown';
import Pagination from '@/components/frontend/Pagination';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import { useSidebarData } from '@/hooks/useCommonData';
import { FrontendArticle1 } from '@/types/frontend';

const ITEMS_PER_PAGE = 6;
const baseUrl = process.env.API_URL || 'http://localhost:8088/api';

interface CategoryClientProps {
    slug: string;
    categoryName: string;
    categoryIcon: string;
}

export default function CategoryClient({ slug, categoryName, categoryIcon }: CategoryClientProps) {
    const { progress, loadingMessage, loadingStates, isAllLoaded } = useSidebarData();

    const [articles, setArticles] = useState<FrontendArticle1[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalArticles, setTotalArticles] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [articlesLoading, setArticlesLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('latest');  // ✅ 排序状态
    const [error, setError] = useState('');

    // 从 localStorage 读取视图偏好
    useEffect(() => {
        const saved = localStorage.getItem('articles-view-mode') as ViewMode;
        if (saved === 'grid' || saved === 'list') {
            setViewMode(saved);
        }
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('articles-view-mode', mode);
    };

    // ✅ 排序变化时重置到第一页
    const handleSortChange = (sort: SortOption) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    // ✅ 加载分类下的文章（带排序）
    useEffect(() => {
        async function fetchArticles() {
            setArticlesLoading(true);
            try {
                const response = await fetch(`${baseUrl}/articles/category`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        slug: slug,
                        page: currentPage,
                        limit: ITEMS_PER_PAGE,
                        sort: sortBy,  // ✅ 传递排序参数
                    }),
                });

                const data = await response.json();

                if (data && data.code === 1) {
                    setArticles(data.data || []);
                    const count = data.count || 0;
                    setTotalArticles(count);
                    setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
                } else {
                    setArticles([]);
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
    }, [slug, currentPage, sortBy]);  // ✅ 依赖增加 sortBy

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isOverallLoading = !isAllLoaded || articlesLoading;

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
                {/* 分类头部 */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <nav className="flex items-center space-x-2 text-sm text-primary-200 mb-4">
                            <a href="/" className="hover:text-white transition-colors">首页</a>
                            <span>/</span>
                            <a href="/categories" className="hover:text-white transition-colors">分类</a>
                            <span>/</span>
                            <span className="text-white font-medium">{categoryName}</span>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                                {categoryIcon}
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold">{categoryName}</h1>
                                <p className="text-primary-200 mt-1">
                                    共 {totalArticles} 篇文章
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {isOverallLoading ? (
                        /* ========== 加载中 ========== */
                        <div>
                            <LoadingProgress
                                progress={progress}
                                loadingMessage={loadingMessage}
                                loadingStates={loadingStates}
                            />

                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                                        <div className="flex gap-2">
                                            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
                                            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((item) => (
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
                                {/* ✅ 标题 + 排序 + 视图切换（一行显示） */}
                                <div className="flex items-center justify-between gap-2 sm:gap-3 mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 truncate">
                                        {categoryName} 下的文章
                                    </h2>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <SortDropdown value={sortBy} onChange={handleSortChange} />
                                        <ViewToggle
                                            viewMode={viewMode}
                                            onViewModeChange={handleViewModeChange}
                                        />
                                    </div>
                                </div>

                                {articles.length > 0 ? (
                                    <>
                                        {viewMode === 'grid' ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {articles.map((article, index) => (
                                                    <ArticleCard
                                                        key={index + 1}
                                                        article={article}
                                                        index={index}
                                                        linkPrefix={`/categories/${slug}/articles`}  // ✅ 关键
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {articles.map((article, index) => (
                                                    <ArticleListItem
                                                        key={index + 1}
                                                        article={article}
                                                        index={index}
                                                        linkPrefix={`/categories/${slug}/articles`}  // ✅ 关键
                                                    />
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
                                        <div className="text-6xl mb-4">📂</div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            暂无文章
                                        </h3>
                                        <p className="text-gray-600">该分类下还没有发布文章</p>
                                    </div>
                                )}
                            </div>

                            <div className="w-full lg:w-80 flex-shrink-0">
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