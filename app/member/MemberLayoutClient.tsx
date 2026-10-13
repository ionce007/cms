// app/member/MemberLayoutClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { MEMBER_MENUS } from '@/config/navigation'

export default function MemberLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoggedIn, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isLoggedIn, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto" />
                    <p className="text-gray-600">加载中...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn || !user) {
        return null;
    }

    const isMenuActive = (menu: typeof MEMBER_MENUS[0]) => {
        if (menu.exact) return pathname === menu.href;
        return pathname === menu.href || pathname.startsWith(menu.href + '/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            会员中心
                        </h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {/* ✅ 关键：窄屏用 order 调整顺序 */}
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* ✅ 右侧内容区：窄屏时先显示（order-1），桌面端在右（order-2） */}
                        <div className="flex-1 min-w-0 order-1 lg:order-2">
                            {children}
                        </div>

                        {/* ✅ 左侧菜单：窄屏时后显示（order-2），桌面端在左（order-1） */}
                        <aside className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1">
                            {/* 用户信息卡片 */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 mb-4">
                                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                                    <img
                                        src={user.avatar || '/img/avatar-default.png'}
                                        alt={user.nickname || user.username}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-gray-800 truncate">
                                            {user.nickname || user.username}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {user.email || user.username}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span
                                        className={cn(
                                            'px-2 py-0.5 rounded-full text-xs font-medium',
                                            user.role === 'admin'
                                                ? 'bg-red-100 text-red-700'
                                                : user.role === 'vip'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-primary-100 text-primary-700'
                                        )}
                                    >
                                        {user.role === 'admin'
                                            ? '👑 管理员'
                                            : user.role === 'vip'
                                                ? '⭐ VIP 会员'
                                                : '👤 普通会员'}
                                    </span>
                                </div>
                            </div>

                            {/* ✅ 菜单：窄屏时横向滚动，桌面端垂直列表 */}
                            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {/* 桌面端：垂直列表 */}
                                <ul className="hidden lg:block">
                                    {MEMBER_MENUS.map((menu) => {
                                        const active = isMenuActive(menu);
                                        return (
                                            <li key={menu.href}>
                                                <Link
                                                    href={menu.href}
                                                    className={cn(
                                                        'flex items-center space-x-3 px-4 py-3 text-sm transition-colors',
                                                        'border-b border-gray-100 last:border-b-0',
                                                        active
                                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    )}
                                                >
                                                    <span className="text-base">{menu.icon}</span>
                                                    <span>{menu.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* ✅ 窄屏：横向滚动的 tab 栏 */}
                                <ul className="lg:hidden flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-thin">
                                    {MEMBER_MENUS.map((menu) => {
                                        const active = isMenuActive(menu);
                                        return (
                                            <li key={menu.href} className="flex-shrink-0">
                                                <Link
                                                    href={menu.href}
                                                    className={cn(
                                                        'flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                                                        active
                                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                                            : 'text-gray-600 hover:bg-gray-100'
                                                    )}
                                                >
                                                    <span>{menu.icon}</span>
                                                    <span>{menu.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>

                            {/* 退出登录 */}
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/');
                                }}
                                className="mt-4 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>退出登录</span>
                            </button>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}