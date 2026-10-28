// app/downloads/[id]/DownloadDetailClient.tsx
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import CoverImage from '@/components/frontend/CoverImage';
import DownloadDetailSkeleton from '@/components/frontend/DownloadDetailSkeleton';
import LoadingProgress from '@/components/frontend/LoadingProgress';
import PaymentModal from '@/components/frontend/PaymentModal';
import ShareButtons from '@/components/frontend/ShareButtons';
import LikeButton from '@/components/frontend/LikeButton';
import BookmarkButton from '@/components/frontend/BookmarkButton';
import { useDownloadDetail } from '@/hooks/useDownloads';
import { useSidebarData } from '@/hooks/useCommonData';
import { useDownloadViewCounter } from '@/hooks/useDownloadViewCounter';
import { formatFileSize, formatTimestamp } from '@/config/constants';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import CommentSection from '@/components/frontend/CommentSection';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import { processHtmlImages } from '@/lib/htmlProcessor';
import { useLightbox } from '@/components/frontend/ImageLightbox';

interface DownloadDetailClientProps {
    id: string;
}

export default function DownloadDetailClient({ id }: DownloadDetailClientProps) {
    const { isLoggedIn, isLoading: authLoading, token } = useAuth();

    const { openLightbox } = useLightbox();

    const { item, isLoading, error } = useDownloadDetail(id);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // ✅ 浏览计数
    const { views } = useDownloadViewCounter({
        fsId: id,
        enabled: !!item,
        initialViews: item?.views || 0,
    });

    const sidebar = useSidebarData();

    const loadingStates = useMemo(() => ({
        ...sidebar.loadingStates,
        download: !isLoading,
    }), [sidebar.loadingStates, isLoading]);

    const completed = Object.values(loadingStates).filter(Boolean).length;
    const total = Object.values(loadingStates).length;
    const progress = Math.round((completed / total) * 100);
    const isAllLoaded = (completed === total) && !authLoading;

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

    const handleCoverClick = (e: React.MouseEvent, src?: string) => {
        if (!src) return;
        const proxyImgSrc = getProxiedImageUrl(src);
        e.preventDefault();
        e.stopPropagation();
        openLightbox([proxyImgSrc]);
    };
    // ✅ 提取点击图片的公共逻辑
    const handleImageClick = (e: React.MouseEvent, src: string) => {
        if (!src) return;
        e.preventDefault();
        e.stopPropagation();
        openLightbox([src]); // 打开灯箱
    };

    // ✅ 统一构造请求头（每次调用时实时构造，避免 token 为 null）
    const getAuthHeaders = useCallback((): Record<string, string> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }, [token]);

    // ✅ 点击"立即下载"
    const handleDownloadClick = () => {
        if (!item) return;

        // ✅ 未登录检查
        if (!isLoggedIn) {
            alert('请先登录');
            return;
        }

        // 免费文件：直接下载
        /*if (item.isSell === 0 || item.price === 0) {
            handleDirectDownload();
            return;
        }*/

        // 付费文件：弹出支付模态框
        setIsPaymentModalOpen(true);
    };

    // ✅ 确认下载
    const handleConfirmDownload = async () => {
        await handleDirectDownload();
        setIsPaymentModalOpen(false);
    };

    // ✅ 实际下载逻辑
    const handleDirectDownload = async () => {
        if (!item) return;

        setIsDownloading(true);
        try {
            const downUrl = `${API_BASE_URL}${API_ENDPOINTS.FORMULA_DETAIL(item.fs_id)}/download`;

            // ✅ 实时构造 headers
            const headers = getAuthHeaders();

            const res = await fetch(downUrl, { headers });

            // ✅ 401 处理
            if (res.status === 401) {
                alert('登录已失效，请重新登录');
                return;
            }

            const data = await res.json();

            if (data.code === 1 && (data.url || data.data?.downloadUrl)) {
                // ✅ 记录下载次数
                try {
                    await fetch(
                        `${API_BASE_URL}/formulas/${item.fs_id}/downloadcount`,
                        {
                            method: 'POST',
                            headers: getAuthHeaders(),
                        }
                    );
                } catch (e) {
                    console.warn('记录下载次数失败:', e);
                }

                window.open(data.url || data.data.downloadUrl, '_blank');
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
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
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
/*
    // ✅ 处理 HTML 中的 HTTP 图片
    const processedContent = useMemo(() => {
        return processHtmlImages(item.content);
    }, [item]);
*/
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
                                    <div className={cn(
                                        "relative aspect-video overflow-hidden",
                                        item.img && "cursor-zoom-in" // 如果有图，显示放大镜光标
                                    )}
                                        onClick={(e) => handleCoverClick(e, item.img)}
                                    >
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
                                                {views}
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
                                                onClick={(e) => {
                                                    // ✅ 利用事件委托，捕获 HTML 内容内的图片点击
                                                    const target = e.target as HTMLElement;
                                                    if (target.tagName === 'IMG') {
                                                        const img = target as HTMLImageElement;
                                                        // 优先取 data-original-src 作为原图地址
                                                        const src = img.getAttribute('data-original-src') || img.src;
                                                        handleImageClick(e, src);
                                                    }
                                                }}
                                                dangerouslySetInnerHTML={{ __html: processHtmlImages(item.content) }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
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

                                {/* 操作按钮 */}
                                <div className="flex items-center justify-between flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100 px-6 pb-6">
                                    <div className="flex items-center space-x-3">
                                        <LikeButton
                                            target="formula"
                                            id={item.fs_id}
                                            initialLikes={item.likes || 0}
                                            initialIsLiked={item.isLiked || false}
                                            size="md"
                                            showLabel
                                        />

                                        <BookmarkButton
                                            target="formula"
                                            id={item.fs_id}
                                            initialMarked={item.marked || 0}
                                            initialIsBookmarked={item.isBookmarked || false}
                                            size="md"
                                            showLabel
                                        />
                                    </div>

                                    <ShareButtons
                                        title={item.server_filename}
                                        url={`/downloads/${item.fs_id}`}
                                    />
                                </div>
                            </article>
                            {/* 评论 */}
                            <CommentSection targetType="formula" targetId={item.fs_id} />
                        </div>

                        {/* 侧边栏 */}
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* 支付模态框 */}
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