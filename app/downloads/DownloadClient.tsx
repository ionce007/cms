// app/downloads/DownloadClient.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import DownloadCard from '@/components/frontend/DownloadCard';
import DownloadListItem from '@/components/frontend/DownloadListItem';
import DownloadSkeleton from '@/components/frontend/DownloadSkeleton';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import ViewToggle, { ViewMode } from '@/components/frontend/ViewToggle';
import SortDropdown, { SortOption } from '@/components/frontend/SortDropdown';
import Pagination from '@/components/frontend/Pagination';
import { useDownloads } from '@/hooks/useDownloads';
import { useSidebarData } from '@/hooks/useCommonData';
import { FORMULA_KINDS, STORAGE_KEYS } from '@/config/constants';

const ITEMS_PER_PAGE = 6;

export default function DownloadClient() {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortOption>('latest');
    const [category, setCategory] = useState<string>('');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // ✅ 下载列表数据
    const {
        items,
        totalItems,
        totalPages,
        isLoading: downloadsLoading,
        error,
    } = useDownloads({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortBy,
        category,
        search,
    });

    // ✅ 侧边栏数据
    const sidebar = useSidebarData();

    // ✅ 组合加载状态：侧边栏 4 项 + 下载列表 1 项 = 5 项
    const loadingStates = useMemo(() => ({
        ...sidebar.loadingStates,
        downloads: !downloadsLoading,
    }), [sidebar.loadingStates, downloadsLoading]);

    const completed = Object.values(loadingStates).filter(Boolean).length;
    const total = Object.values(loadingStates).length;
    const progress = Math.round((completed / total) * 100);
    const isAllLoaded = completed === total;

    // ✅ 加载提示文案
    const loadingMessage = useMemo(() => {
        const pending: string[] = [];
        if (!loadingStates.categories) pending.push('分类');
        if (!loadingStates.tags) pending.push('标签');
        if (!loadingStates.popularArticles) pending.push('热门文章');
        if (!loadingStates.featuredArticles) pending.push('精选文章');
        if (!loadingStates.downloads) pending.push('下载列表');
        if (pending.length === 0) return '加载完成！';
        return `正在加载：${pending.join('、')}...`;
    }, [loadingStates]);

    // 视图偏好
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode;
        if (saved === 'grid' || saved === 'list') {
            setViewMode(saved);
        }
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value);
        setCurrentPage(1);
    };

    const handleSortChange = (value: SortOption) => {
        setSortBy(value);
        setCurrentPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            文件下载
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            共 {totalItems} 个文件可下载
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                    {!isAllLoaded ? (
                        /* ========== 加载中 ========== */
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            <div className="flex-1 min-w-0">
                                {/* ✅ 加载进度 */}
                                <LoadingProgress
                                    progress={progress}
                                    loadingMessage={loadingMessage}
                                    loadingStates={loadingStates}
                                />

                                {/* ✅ 骨架屏 */}
                                <DownloadSkeleton viewMode={viewMode} />
                            </div>

                            {/* 侧边栏骨架 */}
                            <div className="w-full lg:w-80 flex-shrink-0">
                                <div className="space-y-6">
                                    {[1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            className="bg-white rounded-xl border border-gray-200 p-5"
                                        >
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
                    ) : error ? (
                        /* ========== 错误 ========== */
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">😕</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                加载失败
                            </h3>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    ) : (
                        /* ========== 正常内容 ========== */
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                            {/* 主内容 */}
                            <div className="flex-1 min-w-0">
                                {/* 筛选栏 */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <div className="flex-1 min-w-full sm:min-w-[200px]">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => handleSearchChange(e.target.value)}
                                                    placeholder="搜索文件..."
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                                <svg
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <SortDropdown value={sortBy} onChange={handleSortChange} />
                                            <ViewToggle
                                                viewMode={viewMode}
                                                onViewModeChange={handleViewModeChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
                                        <button
                                            onClick={() => handleCategoryChange('')}
                                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${category === ''
                                                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            全部
                                        </button>
                                        {FORMULA_KINDS.map((k) => (
                                            <button
                                                key={k.value}
                                                onClick={() => handleCategoryChange(k.value)}
                                                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${category === k.value
                                                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {k.icon} {k.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 列表内容 */}
                                {items.length > 0 ? (
                                    <>
                                        {viewMode === 'grid' ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                                {items.map((item, index) => (
                                                    <DownloadCard
                                                        key={item.fs_id}
                                                        item={item}
                                                        index={index}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-3 lg:space-y-4">
                                                {items.map((item, index) => (
                                                    <DownloadListItem
                                                        key={item.fs_id}
                                                        item={item}
                                                        index={index}
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
                                        <div className="text-6xl mb-4">📁</div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            暂无文件
                                        </h3>
                                        <p className="text-gray-600">没有找到符合条件的文件</p>
                                    </div>
                                )}
                            </div>

                            {/* 侧边栏 */}
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