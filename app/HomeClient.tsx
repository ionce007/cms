// app/HomeClient.tsx
'use client';

import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import HeroSection from '@/components/frontend/HeroSection';
import ArticleList from '@/components/frontend/ArticleList';
import Sidebar from '@/components/frontend/Sidebar';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import HomeSkeleton from '@/components/frontend/HomeSkeleton';
import { useHomeData } from '@/hooks/useHomeData';

export default function HomeClient() {
    const {
        featuredArticle,
        recentArticles,
        isLoading,
        progress,
        loadingStates,
        loadingMessage,
        error,
        refresh,
    } = useHomeData();

    // ========== 加载中 ==========
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                    {/* ✅ 加载进度 */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                        <LoadingProgress
                            progress={progress}
                            loadingMessage={loadingMessage}
                            loadingStates={loadingStates}
                        />
                    </div>

                    {/* ✅ 骨架屏 */}
                    <HomeSkeleton />
                </main>
                <Footer />
            </div>
        );
    }

    // ========== 错误 ==========
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            加载失败
                        </h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={refresh}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                            🔄 重新加载
                        </button>
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
                {/* Hero 区域 */}
                <HeroSection article={featuredArticle ?? null} />

                {/* 主内容 */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 min-w-0">
                            <ArticleList articles={recentArticles} />
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