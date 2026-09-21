// app/articles/[id]/ArticleClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import ArticleDetailView from '@/components/frontend/ArticleDetailView';
import ArticleSkeleton from '@/components/frontend/ArticleSkeleton';
import ArticleLoadingProgress from '@/components/frontend/ArticleLoadingProgress';
import { useArticle } from '@/hooks/useArticle';

interface ArticleClientProps {
    articleId: number;
}

export default function ArticleClient({ articleId }: ArticleClientProps) {
    const { article, relatedArticles, isLoading, error } = useArticle(articleId);

    // ✅ 模拟加载进度（基于真实加载状态驱动）
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isLoading) {
            setProgress(0);

            // 进度从 0 增长到 90%
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    const increment = Math.floor(Math.random() * 15) + 5;
                    return Math.min(prev + increment, 90);
                });
            }, 150);

            return () => clearInterval(interval);
        } else {
            // ✅ 数据加载完成后，进度跳到 100%
            setProgress(100);
        }
    }, [isLoading]);

    // ========== 加载中 ==========
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 min-w-0">
                                {/* ✅ 加载进度条 */}
                                <ArticleLoadingProgress
                                    progress={progress}
                                    label="正在加载文章..."
                                />

                                {/* ✅ 文章骨架屏 */}
                                <ArticleSkeleton />
                            </div>

                            {/* 右侧边栏骨架 */}
                            <div className="w-full lg:w-80 flex-shrink-0">
                                <div className="space-y-6">
                                    {[1, 2, 3].map(item => (
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
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ========== 错误 ==========
    if (error || !article) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">😕</div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                        加载失败
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        {error?.message || '文章不存在或已被删除'}
                                    </p>
                                    <a
                                        href="/articles"
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                                    >
                                        <span>返回文章列表</span>
                                    </a>
                                </div>
                            </div>
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

    // ========== 正常内容 ==========
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 min-w-0">
                            <ArticleDetailView
                                article={article}
                                relatedArticles={relatedArticles}
                                breadcrumbItems={[
                                    { label: '首页', href: '/', icon: '🏠' },
                                    { label: '文章', href: '/articles' },
                                    { label: article.title },
                                ]}
                                backLink={{
                                    label: '文章列表',
                                    href: '/articles',
                                }}
                            />
                        </div>

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