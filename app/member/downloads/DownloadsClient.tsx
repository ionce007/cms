// app/member/downloads/DownloadsClient.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CoverImage from '@/components/frontend/CoverImage';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/env';
import { formatFileSize } from '@/config/constants';

interface DownloadItem {
    id: number;
    targetType: string;
    targetId: number;
    downloadCount: number;
    lastDownloadAt: string;
    createdAt: string;
    formula?: any;
    article?: any;
}

export default function DownloadsClient() {
    const { token } = useAuth();
    const [items, setItems] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // ✅ 获取下载历史
    useEffect(() => {
        if (!token) return;

        let isMounted = true;

        async function fetchData() {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    limit: '10',
                });

                const res = await fetch(`${API_BASE_URL}/member/downloads?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (isMounted && data.code === 1) {
                    setItems(data.data || []);
                    setTotalCount(data.count || 0);
                    setTotalPages(Math.ceil((data.count || 0) / 10));
                }
            } catch (err) {
                console.error('获取下载记录失败:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [token, page]);

    return (
        <div className="space-y-6">
            {/* 头部 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800">我的下载</h2>
                <p className="text-sm text-gray-500 mt-1">
                    共 {totalCount} 条记录
                </p>
            </div>

            {/* 列表 */}
            {isLoading ? (
                /* 加载中骨架 */
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
                        >
                            <div className="flex gap-4">
                                <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : items.length > 0 ? (
                /* 正常列表 */
                <>
                    <div className="space-y-4">
                        {items.map((item) => {
                            const formula = item.formula;
                            const detailUrl = `/downloads/${item.targetId}`;
                            const imgSrc = formula?.img;
                            const title = formula?.server_filename;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row">
                                        {/* ✅ 封面图：固定尺寸 + CoverImage */}
                                        <Link
                                            href={detailUrl}
                                            className="relative flex-shrink-0 overflow-hidden
                                                w-full h-48
                                                sm:w-32 sm:h-32
                                                md:w-36 md:h-32
                                                lg:w-40 lg:h-32"
                                        >
                                            <CoverImage
                                                src={imgSrc}
                                                alt={title || '文件封面'}
                                                aspectRatio="fill"
                                                objectFit="cover"
                                                useBlurBackground={false}
                                                fallbackIcon="📦"
                                                className="w-full h-full"
                                            />
                                        </Link>

                                        {/* 内容 */}
                                        <div className="flex-1 p-4 flex flex-col min-w-0">
                                            {/* 标签行 */}
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                                                    📥 已下载 {item.downloadCount} 次
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    最后下载：{new Date(item.lastDownloadAt).toLocaleDateString('zh-CN')}
                                                </span>
                                            </div>

                                            {/* 文件名 */}
                                            <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                                                <Link href={detailUrl}>
                                                    {title || '未知文件'}
                                                </Link>
                                            </h3>

                                            {/* 摘要 */}
                                            {formula?.summary && (
                                                <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                                                    {formula.summary}
                                                </p>
                                            )}

                                            {/* 撑开剩余空间 */}
                                            <div className="flex-1" />

                                            {/* 底部信息 */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-400">
                                                    {formatFileSize(formula?.size || 0)}
                                                </div>
                                                <Link
                                                    href={detailUrl}
                                                    className="text-xs text-primary-600 hover:text-primary-700 transition-colors font-medium"
                                                >
                                                    重新下载 →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-2 pt-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                上一页
                            </button>
                            <span className="text-sm text-gray-600">
                                第 {page} / {totalPages} 页
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </>
            ) : (
                /* 空状态 */
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                    <div className="text-6xl mb-4">📥</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        暂无下载记录
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        去下载页探索更多优质资源
                    </p>
                    <Link
                        href="/downloads"
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        <span>浏览下载</span>
                    </Link>
                </div>
            )}
        </div>
    );
}