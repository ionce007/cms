// app/category/[slug]/articles/[id]/CategoryArticleClient.tsx
'use client';

import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import ArticleDetailView from '@/components/frontend/ArticleDetailView';
import ArticleDetailSkeleton from '@/components/frontend/ArticleDetailSkeleton';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import { useArticleDetailWithSidebar } from '@/hooks/useArticleDetail';
import { useEffect } from 'react';

interface CategoryArticleClientProps {
    slug: string;
    categoryName: string;
    categoryIcon: string;
    articleId: number;
}

export default function CategoryArticleClient({
    slug,
    categoryName,
    categoryIcon,
    articleId,
}: CategoryArticleClientProps) {
    const {
        article,
        relatedArticles,  // ✅ 获取关联文章
        articleError,
        progress,
        loadingStates,
        loadingMessage,
        isAllLoaded,
    } = useArticleDetailWithSidebar(articleId);

    /*useEffect(() => {
        console.log('article = ', article)
    }, [article, relatedArticles])*/
    // 加载中...
    if (!isAllLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 min-w-0">
                                <LoadingProgress
                                    progress={progress}
                                    loadingMessage={loadingMessage}
                                    loadingStates={loadingStates}
                                />
                                <ArticleDetailSkeleton />
                            </div>
                            <div className="w-full lg:w-80 flex-shrink-0">
                                <div className="space-y-6">
                                    {[1, 2, 3].map(item => (
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
                </main>
                <Footer />
            </div>
        );
    }

    // 错误处理...
    if (articleError || !article) {
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
                                        {articleError || '文章不存在或已被删除'}
                                    </p>
                                    <a
                                        href={`/categories/${slug}`}
                                        className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        <span>返回{categoryName}</span>
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 min-w-0">
                            <ArticleDetailView
                                article={article}
                                relatedArticles={relatedArticles}  // ✅ 传递关联文章
                                relatedLinkPrefix={`/categories/${slug}`}  // ✅ 关联文章链接保持在分类下
                                breadcrumbItems={[
                                    { label: '首页', href: '/', icon: '🏠' },
                                    { label: '分类', href: '/categories' },
                                    { label: categoryName, href: `/categories/${slug}`, icon: categoryIcon },
                                    { label: article.title },
                                ]}
                                backLink={{
                                    label: categoryName,
                                    href: `/categories/${slug}`,
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