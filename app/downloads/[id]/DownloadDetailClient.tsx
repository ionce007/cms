// app/downloads/[id]/DownloadDetailClient.tsx
'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import CoverImage from '@/components/frontend/CoverImage';
import DownloadDetailSkeleton from '@/components/frontend/DownloadDetailSkeleton';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import PaymentModal from '@/components/frontend/PaymentModal';  // ✅ 导入
import { useDownloadDetail } from '@/hooks/useDownloads';
import { useSidebarData } from '@/hooks/useCommonData';
import { formatFileSize, formatTimestamp } from '@/config/constants';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes';

interface DownloadDetailClientProps {
    id: string;
}

export default function DownloadDetailClient({ id }: DownloadDetailClientProps) {
    const { item, isLoading, error } = useDownloadDetail(id);
    const [isDownloading, setIsDownloading] = useState(false);
    // ✅ 支付模态框状态
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const sidebar = useSidebarData();

    const loadingStates = useMemo(() => ({
        ...sidebar.loadingStates,
        download: !isLoading,
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
        if (!loadingStates.download) pending.push('文件详情');
        if (pending.length === 0) return '加载完成！';
        return `正在加载：${pending.join('、')}...`;
    }, [loadingStates]);

    // ✅ 点击"立即下载"→ 打开支付模态框
    const handleDownloadClick = () => {
        if (!item) return;

        // 免费文件：直接下载
        if (item.isSell === 0 || item.price === 0) {
            handleDirectDownload();
            return;
        }

        // 付费文件：弹出支付模态框
        setIsPaymentModalOpen(true);
    };

    // ✅ 确认下载（支付模态框里的"立即下载"按钮）
    const handleConfirmDownload = async () => {
        await handleDirectDownload();
        // 下载成功后关闭模态框
        setIsPaymentModalOpen(false);
    };

    // ✅ 实际下载逻辑
    const handleDirectDownload = async () => {
        if (!item) return;

        setIsDownloading(true);
        try {
            const downUrl = `${API_BASE_URL}${API_ENDPOINTS.FORMULA_DETAIL(item.fs_id)}/download`
            const res = await fetch(downUrl);
            debugger
            const data = await res.json();

            if (data.code === 1 && data.url) {
                window.open(data.url, '_blank');
            } else {
                alert(data.message || '获取下载链接失败');
            }
        } catch (err) {
            console.error('下载失败:', err);
            alert('下载失败，请稍后重试');
        } finally {
            setIsDownloading(false);
        }
    };

    // ========== 加载中 ==========
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
                                <DownloadDetailSkeleton />
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
                </main>
                <Footer />
            </div>
        );
    }

    // ========== 错误 ==========
    if (error || !item) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">文件不存在</h2>
                        <p className="text-gray-600 mb-6">{error || '该文件可能已被删除'}</p>
                        <a
                            href="/downloads"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                        >
                            <span>返回下载列表</span>
                        </a>
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
                    {/* 面包屑 */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                        <a href="/" className="hover:text-primary-600 transition-colors">首页</a>
                        <span>/</span>
                        <a href="/downloads" className="hover:text-primary-600 transition-colors">下载</a>
                        <span>/</span>
                        <span className="text-gray-800 font-medium truncate max-w-[200px]">
                            {item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))}
                        </span>
                    </nav>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 主内容 */}
                        <div className="flex-1 min-w-0">
                            <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {/* 封面图 */}
                                {item.img && (
                                    <div className="relative aspect-video overflow-hidden">
                                        <CoverImage
                                            src={item.img}
                                            alt={item.server_filename}
                                            aspectRatio="fill"
                                            objectFit="contain"
                                            useBlurBackground={true}
                                            fallbackIcon="📄"
                                        />
                                    </div>
                                )}

                                {/* 文件信息 */}
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                                        {item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))}
                                    </h1>

                                    {item.summary && (
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            {item.summary}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-6">
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">文件大小</div>
                                            <div className="text-sm font-medium text-gray-700">
                                                {formatFileSize(item.size)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">上传时间</div>
                                            <div className="text-sm font-medium text-gray-700">
                                                {formatTimestamp(item.server_ctime)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">浏览次数</div>
                                            <div className="text-sm font-medium text-gray-700">
                                                {item.views}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">价格</div>
                                            <div className="text-sm font-medium text-gray-700">
                                                {item.isSell === 0 || item.price === 0
                                                    ? '免费'
                                                    : `¥${item.price}`}
                                            </div>
                                        </div>
                                    </div>

                                    {item.content && (
                                        <div className="mb-6">
                                            <h2 className="text-lg font-bold text-gray-800 mb-3">
                                                文件说明
                                            </h2>
                                            <div
                                                className="article-html-content prose prose-gray max-w-none"
                                                dangerouslySetInnerHTML={{ __html: item.content }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                        {/* ✅ 点击打开支付模态框 */}
                                        <button
                                            onClick={handleDownloadClick}
                                            disabled={isDownloading}
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                        >
                                            {isDownloading ? (
                                                <>
                                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    <span>准备中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    <span>立即下载</span>
                                                </>
                                            )}
                                        </button>

                                        <a
                                            href="/downloads"
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span>返回列表</span>
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* 侧边栏 */}
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* ✅ 支付模态框 */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                fs_id={item.fs_id}
                fileName={item.server_filename}
                price={item.price}
                onConfirmDownload={handleConfirmDownload}
            />
        </div>
    );
}