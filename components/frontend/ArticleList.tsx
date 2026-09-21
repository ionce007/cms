// components/frontend/ArticleList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FrontendArticle1 } from '@/types/frontend';
import ArticleCard from './ArticleCard';
import ArticleListItem from './ArticleListItem';
import ViewToggle, { ViewMode } from './ViewToggle';

interface ArticleListProps {
    articles: FrontendArticle1[];
    title?: string;
    showViewToggle?: boolean;  // ✅ 是否显示视图切换
}

export default function ArticleList({
    articles,
    title = '最新文章',
    showViewToggle = true,
}: ArticleListProps) {
    // ✅ 视图模式状态
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    // ✅ 从 localStorage 读取用户偏好（与文章页共享偏好）
    useEffect(() => {
        const savedViewMode = localStorage.getItem('articles-view-mode') as ViewMode;
        if (savedViewMode === 'grid' || savedViewMode === 'list') {
            setViewMode(savedViewMode);
        }
    }, []);

    // ✅ 保存用户偏好
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('articles-view-mode', mode);
    };

    return (
        <div>
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <div className="flex items-center gap-3">
                    {/* ✅ 视图切换按钮 */}
                    {showViewToggle && (
                        <ViewToggle
                            viewMode={viewMode}
                            onViewModeChange={handleViewModeChange}
                        />
                    )}

                    {/* 查看全部 */}
                    <Link
                        href="/articles"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                    >
                        <span>查看全部</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ✅ 根据视图模式渲染 */}
            {viewMode === 'grid' ? (
                /* 网格视图 */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article, index) => (
                        <ArticleCard key={index + 1} article={article} index={index} />
                    ))}
                </div>
            ) : (
                /* 列表视图 */
                <div className="space-y-4">
                    {articles.map((article, index) => (
                        <ArticleListItem key={article.id} article={article} index={index} />
                    ))}
                </div>
            )}

            {/* 加载更多 */}
            <div className="mt-8 text-center">
                <Link
                    href="/articles"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                    <span>浏览更多文章</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}