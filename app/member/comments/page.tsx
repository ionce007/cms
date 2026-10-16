// app/member/comments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CommentCard, { MemberComment } from '../components/CommentCard';
import EmptyState from '../components/EmptyState';
import Pagination from '@/components/frontend/Pagination';
import TargetTypeTabs, { TargetType } from '../components/TargetTypeTabs';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberFetch } from '@/hooks/useMemberFetch';

const ITEMS_PER_PAGE = 10;

export default function MyCommentsPage() {
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    const { memberFetch } = useMemberFetch();

    const [comments, setComments] = useState<MemberComment[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<TargetType>('all');
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
                targetType: activeTab,
            });

            const result = await memberFetch<MemberComment[]>(
                `/member/comments?${query.toString()}`
            );

            if (cancelled) return;

            if (result.ok && result.data) {
                setComments(result.data);
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
    }, [authLoading, isLoggedIn, currentPage, activeTab, memberFetch]);

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这条评论吗？')) return;

        const result = await memberFetch(`/member/comments/${id}`, {
            method: 'DELETE',
        });

        if (result.ok) {
            setComments(prev => prev.filter(c => c.id !== id));
        } else {
            alert(result.message || '删除失败');
        }
    };

    const handleTabChange = (tab: TargetType) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">我的评论</h1>
                <p className="text-sm text-gray-500">你发表过的文章和公式评论</p>
            </div>

            <TargetTypeTabs value={activeTab} onChange={handleTabChange} />

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                        >
                            <div className="flex gap-3 mb-4">
                                <div className="w-14 h-14 bg-gray-200 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200">
                    <EmptyState
                        icon="💬"
                        title={
                            activeTab === 'article'
                                ? '还没有评论过任何文章'
                                : activeTab === 'formula'
                                    ? '还没有评论过任何公式'
                                    : '还没有发表过任何评论'
                        }
                        description="去文章或公式页面参与讨论吧"
                        actionLabel="浏览文章"
                        actionHref="/articles"
                    />
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </>
    );
}