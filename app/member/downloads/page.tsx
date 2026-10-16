// app/member/downloads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import Pagination from '@/components/frontend/Pagination';
import MixedContentListItem, {
    MixedContentRecord,
} from '../components/MixedContentListItem';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberFetch } from '@/hooks/useMemberFetch';

const ITEMS_PER_PAGE = 10;

export default function MyDownloadsPage() {
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    const { memberFetch } = useMemberFetch();

    const [records, setRecords] = useState<MixedContentRecord[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            setLoading(true);
            setError('');

            const query = new URLSearchParams({
                page: String(currentPage),
                limit: String(ITEMS_PER_PAGE),
            });

            const result = await memberFetch<MixedContentRecord[]>(
                `/member/downloads?${query.toString()}`
            );

            if (cancelled) return;

            if (result.ok && result.data) {
                setRecords(result.data);
                const total = (result as any).count || result.data.length;
                setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
            } else if (result.status !== 401) {
                setError(result.message || '加载失败');
            }

            setLoading(false);
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [authLoading, isLoggedIn, currentPage, memberFetch]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">我的下载</h1>
                <p className="text-sm text-gray-500">你下载过的公式文件</p>
            </div>

            {loading ? (
                /* 骨架屏（列表形式） */
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden 
                         flex flex-col sm:flex-row animate-pulse"
                        >
                            <div
                                className="sm:w-40 lg:w-48 flex-shrink-0 bg-gray-200 
                           aspect-video sm:aspect-auto sm:min-h-[120px]"
                            />
                            <div className="flex-1 p-4 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                /* 错误 */
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            ) : records.length === 0 ? (
                /* 空状态 */
                <div className="bg-white rounded-xl border border-gray-200">
                    <EmptyState
                        icon="📥"
                        title="还没有下载过任何公式"
                        description="去公式页面看看吧"
                        actionLabel="浏览公式"
                        actionHref="/formulas"
                    />
                </div>
            ) : (
                /* ✅ 列表形式展示 */
                <>
                    <div className="space-y-3">
                        {records.map(record => (
                            <MixedContentListItem
                                key={record.id}
                                record={record}
                                actionLabel="查看详情"
                                showDownloadStats={true}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </>
    );
}