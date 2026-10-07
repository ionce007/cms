// app/member/MemberClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function MemberClient() {
    const router = useRouter();
    const { user, isLoggedIn, isLoading } = useAuth();

    // ✅ 未登录跳转
    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push('/login');
        }
    }, [isLoading, isLoggedIn, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
            </div>
        );
    }

    if (!isLoggedIn || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            会员中心
                        </h1>
                        <p className="text-gray-600">管理您的账户信息</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 min-w-0">
                            {/* 用户信息卡片 */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={user.avatar || '/img/avatar-default.png'}
                                        alt={user.nickname || user.username}
                                        className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100"
                                    />
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {user.nickname || user.username}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {user.email || user.username}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                                                {user.role === 'admin' ? '管理员' :
                                                    user.role === 'vip' ? 'VIP 会员' : '普通会员'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 功能入口 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    {
                                        title: '我的下载',
                                        desc: '查看下载历史',
                                        href: '/member/downloads',
                                        icon: '📥',
                                    },
                                    {
                                        title: '我的点赞',
                                        desc: '查看点赞内容',
                                        href: '/member/likes',
                                        icon: '❤️',
                                    },
                                    {
                                        title: '账号设置',
                                        desc: '修改个人信息',
                                        href: '/member/settings',
                                        icon: '⚙️',
                                    },
                                    {
                                        title: '修改密码',
                                        desc: '更新登录密码',
                                        href: '/member/password',
                                        icon: '🔒',
                                    },
                                ].map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all group"
                                    >
                                        <div className="text-3xl mb-2">{item.icon}</div>
                                        <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.desc}
                                        </p>
                                    </a>
                                ))}
                            </div>
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