// app/member/page.tsx
'use client';

import { useState, useEffect } from 'react';
import MemberStatCards from './components/MemberStatCards';
import EmptyState from './components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberFetch } from '@/hooks/useMemberFetch';

interface MemberStats {
    comments: number;
    likes: number;
    favorites: number;
    downloads: number;
}

export default function MemberPage() {
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    const { memberFetch } = useMemberFetch();

    const [counts, setCounts] = useState<MemberStats>({
        comments: 0,
        likes: 0,
        favorites: 0,
        downloads: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ 1. 等 AuthContext 恢复完成
        if (authLoading) return;

        // ✅ 2. 未登录不请求
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            const result = await memberFetch<MemberStats>('/member/stats');

            if (cancelled) return;

            if (result.ok && result.data) {
                setCounts({
                    comments: result.data.comments || 0,
                    likes: result.data.likes || 0,
                    favorites: result.data.favorites || 0,
                    downloads: result.data.downloads || 0,
                });
            } else {
                // 401 或其他错误时静默处理，保持 0
                if (result.status !== 401) {
                    console.error('获取统计失败:', result.message);
                }
            }

            setLoading(false);
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [authLoading, isLoggedIn, memberFetch]);

    return (
        <>
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    会员中心
                </h1>
                <p className="text-gray-600">管理你的评论、点赞、收藏和下载</p>
            </div>

            {/* 四个入口卡片 */}
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                        >
                            <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                            <div className="h-6 bg-gray-200 rounded w-12" />
                        </div>
                    ))}
                </div>
            ) : (
                <MemberStatCards counts={counts} />
            )}

            {/* 最近动态 */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">最近动态</h2>
                <EmptyState
                    icon="📭"
                    title="暂无动态"
                    description="你最近的活动会显示在这里"
                />
            </div>
        </>
    );
}