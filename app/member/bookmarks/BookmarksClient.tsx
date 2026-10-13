// app/member/bookmarks/BookmarksClient.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CoverImage from '@/components/frontend/CoverImage';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/env';
import { formatFileSize } from '@/config/constants';
import { cn } from '@/lib/utils';

type TargetType = 'all' | 'article' | 'formula';

interface BookmarkItem {
    id: number;
    targetType: string;
    targetId: number;
    createdAt: string;
    article?: any;
    formula?: any;
}

export default function BookmarksClient() {
    const { token } = useAuth();
    const [items, setItems] = useState<BookmarkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<TargetType>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // ✅ 获取收藏列表
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
                if (filter !== 'all') params.append('targetType', filter);

                const res = await fetch(`${API_BASE_URL}/member/bookmarks?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (isMounted && data.code === 1) {
                    setItems(data.data || []);
                    setTotalCount(data.count || 0);
                    setTotalPages(Math.ceil((data.count || 0) / 10));
                }
            } catch (err) {
                console.error('获取收藏失败:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [token, page, filter]);

    // ✅ 取消收藏
    const handleUnbookmark = async (item: BookmarkItem) => {
        if (!token) return;
        if (!confirm('确定取消收藏？')) return;

        try {
            const endpoint = item.targetType === 'article'
                ? `${API_BASE_URL}/articles/${item.targetId}/bookmark`
                : `${API_BASE_URL}/formulas/${item.targetId}/bookmark`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action: 'unbookmark' }),
            });

            const data = await res.json();

            if (data.code === 1) {
                setItems(prev => prev.filter(i => i.id !== item.id));
                setTotalCount(prev => Math.max(0, prev - 1));
            } else {
                alert(data.message || '操作失败');
            }
        } catch (err) {
            console.error('取消收藏失败:', err);
            alert('操作失败');
        }
    };

    return (
        <div className="space-y-6">
            {/* 头部 + 筛选 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">我的收藏</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            共 {totalCount} 条记录
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        { value: 'all', label: '全部', icon: '📋' },
                        { value: 'article', label: '文章', icon: '📄' },
                        { value: 'formula', label: '下载', icon: '📦' },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setFilter(tab.value as TargetType);
                                setPage(1);
                            }}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                filter === tab.value
                                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                            )}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
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
                            const article = item.article;
                            const formula = item.formula;

                            const detailUrl = item.targetType === 'article'
                                ? `/articles/${item.targetId}`
                                : `/downloads/${item.targetId}`;

                            const imgSrc = item.targetType === 'article'
                                ? article?.img
                                : formula?.img;

                            const title = item.targetType === 'article'
                                ? article?.title
                                : formula?.server_filename;

                            const subInfo = item.targetType === 'article'
                                ? `${article?.pv || 0} 阅读`
                                : formatFileSize(formula?.size || 0);

                            const fallbackIcon = item.targetType === 'article'
                                ? '📄'
                                : '📦';

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
                                                alt={title || '封面图'}
                                                aspectRatio="fill"
                                                objectFit="cover"
                                                useBlurBackground={false}
                                                fallbackIcon={fallbackIcon}
                                                className="w-full h-full"
                                            />
                                        </Link>

                                        {/* 内容 */}
                                        <div className="flex-1 p-4 flex flex-col min-w-0">
                                            {/* 标签行 */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full font-medium">
                                                    🔖 收藏
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                                                </span>
                                            </div>

                                            {/* 标题 */}
                                            <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                                                <Link href={detailUrl}>
                                                    {title || '未知内容'}
                                                </Link>
                                            </h3>

                                            {/* 撑开剩余空间 */}
                                            <div className="flex-1" />

                                            {/* 底部信息 */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-400">
                                                    {subInfo}
                                                </div>
                                                <button
                                                    onClick={() => handleUnbookmark(item)}
                                                    className="text-xs text-primary-500 hover:text-primary-700 transition-colors"
                                                >
                                                    取消收藏
                                                </button>
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
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        暂无收藏
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        收藏喜欢的内容，方便以后查看
                    </p>
                    <Link
                        href="/articles"
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                        <span>浏览内容</span>
                    </Link>
                </div>
            )}
        </div>
    );
}