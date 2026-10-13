// app/member/MemberClient.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/env';

interface Stats {
    likes: number;
    bookmarks: number;
    downloads: number;
}

export default function MemberClient() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<Stats>({
        likes: 0,
        bookmarks: 0,
        downloads: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // ✅ 获取统计数据
    useEffect(() => {
        if (!token) return;

        async function fetchStats() {
            try {
                const [likesRes, bookmarksRes, downloadsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/member/likes?limit=1`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/member/bookmarks?limit=1`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/member/downloads?limit=1`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const [likesData, bookmarksData, downloadsData] = await Promise.all([
                    likesRes.json(),
                    bookmarksRes.json(),
                    downloadsRes.json(),
                ]);

                setStats({
                    likes: likesData.count || 0,
                    bookmarks: bookmarksData.count || 0,
                    downloads: downloadsData.count || 0,
                });
            } catch (err) {
                console.error('获取统计数据失败:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchStats();
    }, [token]);

    const menuItems = [
        {
            title: '我的点赞',
            desc: '查看点赞过的文章和文件',
            href: '/member/likes',
            icon: '❤️',
            color: 'from-red-500 to-red-600',
            count: stats.likes,
        },
        {
            title: '我的收藏',
            desc: '查看收藏的内容',
            href: '/member/bookmarks',
            icon: '🔖',
            color: 'from-primary-500 to-primary-600',
            count: stats.bookmarks,
        },
        {
            title: '我的下载',
            desc: '查看下载历史',
            href: '/member/downloads',
            icon: '📥',
            color: 'from-green-500 to-green-600',
            count: stats.downloads,
        },
    ];

    return (
        <div className="space-y-6">
            {/* ✅ 欢迎卡片 */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    欢迎回来，{user?.nickname || user?.username}！
                </h2>
                <p className="text-primary-100 text-sm">
                    在这里管理您的点赞、收藏和下载记录
                </p>
            </div>

            {/* ✅ 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg`}
                            >
                                {item.icon}
                            </div>
                            <svg
                                className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            {isLoading ? (
                                <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" />
                            ) : (
                                item.count
                            )}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                            {item.title}
                        </div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                    </Link>
                ))}
            </div>

            {/* ✅ 快捷入口 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">快捷操作</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: '浏览文章', href: '/articles', icon: '📄' },
                        { label: '下载文件', href: '/downloads', icon: '📦' },
                        { label: '账号设置', href: '/member/settings', icon: '⚙️' },
                        { label: '修改密码', href: '/member/password', icon: '🔒' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
                        >
                            <span className="text-2xl mb-2">{item.icon}</span>
                            <span className="text-xs text-gray-700 group-hover:text-primary-600 transition-colors">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}