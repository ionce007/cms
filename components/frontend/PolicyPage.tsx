// components/frontend/PolicyPage.tsx
'use client';

import { useMemo } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import ArticleContent from '@/components/frontend/ArticleContent';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import { useSidebarData, useFrag, useSiteInfo } from '@/hooks/useCommonData';

interface PolicyPageProps {
    /** cms_frag 表的 mark 值 */
    mark: string;
    /** 页面标题（数据库无数据时的兜底） */
    fallbackTitle: string;
    /** 页面描述 */
    fallbackDescription?: string;
}

export default function PolicyPage({
    mark,
    fallbackTitle,
    fallbackDescription,
}: PolicyPageProps) {
    // ✅ 从数据库读取政策内容
    const { frag, isLoading, error } = useFrag(mark);
    const sidebar = useSidebarData();
    const siteInfo = useSiteInfo().siteinfo;

    // ✅ 组合加载状态
    const loadingStates = useMemo(() => ({
        ...sidebar.loadingStates,
        policy: !isLoading,
    }), [sidebar.loadingStates, isLoading]);

    const completed = Object.values(loadingStates).filter(Boolean).length;
    const total = Object.values(loadingStates).length;
    const progress = Math.round((completed / total) * 100);
    const isAllLoaded = completed === total;

    const loadingMessage = useMemo(() => {
        const pending: string[] = [];
        if (!loadingStates.categories) pending.push('分类');
        if (!loadingStates.tags) pending.push('标签');
        if (!loadingStates.popularArticles) pending.push('热门文章');
        if (!loadingStates.featuredArticles) pending.push('精选文章');
        if (!loadingStates.policy) pending.push('页面内容');
        if (pending.length === 0) return '加载完成！';
        return `正在加载：${pending.join('、')}...`;
    }, [loadingStates]);

    // ========== 加载中 ==========
    if (!isAllLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 min-w-0">
                                <LoadingProgress
                                    progress={progress}
                                    loadingMessage={loadingMessage}
                                    loadingStates={loadingStates}
                                />
                                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-4">
                                    <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                                </div>
                            </div>
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
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ========== 正常内容 ==========
    const title = frag?.name || fallbackTitle;
    const content = (frag?.content || '').replaceAll('【网站名称】', `“${siteInfo?.name || ''}”`).replaceAll('【网站邮箱】', siteInfo?.json.email || '');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {title}
                        </h1>
                        {fallbackDescription && (
                            <p className="text-gray-600">{fallbackDescription}</p>
                        )}
                        {frag?.updatedAt && (
                            <p className="text-sm text-gray-400 mt-2">
                                最后更新：
                                {new Date(frag.updatedAt).toLocaleDateString('zh-CN')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 主内容 */}
                        <div className="flex-1 min-w-0">
                            {content ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
                                    <ArticleContent content={content} />
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">📄</div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                        内容未配置
                                    </h2>
                                    <p className="text-gray-600">
                                        请在管理后台配置 mark 为{' '}
                                        <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">
                                            {mark}
                                        </code>{' '}
                                        的内容
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 侧边栏 */}
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