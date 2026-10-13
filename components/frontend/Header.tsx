// components/frontend/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useAuth } from '@/contexts/AuthContext';
import { NAV_ITEMS, isNavActive } from '@/config/navigation';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { siteConfig } = useSiteConfig();
    const { user, isLoggedIn, logout } = useAuth();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLElement>(null);

    // 滚动监听
    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 路由变化关闭移动菜单
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
        setSearchTerm('');
    }, [pathname]);

    // 打开菜单时锁定滚动
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    // Ctrl+K 打开搜索
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 搜索提交
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const term = searchTerm.trim();
        if (term) {
            router.push(`/articles?search=${encodeURIComponent(term)}`);
            setIsSearchOpen(false);
            setSearchTerm('');
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        router.push('/');
    };

    return (
        <header
            ref={headerRef}
            className={cn(
                'sticky top-0 z-50 transition-all duration-300',
                isMounted && isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60'
                    : 'bg-white border-b border-gray-200'
            )}
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* ==================== 左侧：Logo + 导航 ==================== */}
                    {/* ✅ 关键1：flex-1 撑开，让导航紧挨 Logo */}
                    <div className="flex items-center gap-3 sm:gap-6 lg:gap-10 flex-1 min-w-0">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center space-x-2 flex-shrink-0 min-w-0"
                        >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-white font-bold text-base sm:text-lg">
                                    {siteConfig.json?.logo || '📝'}
                                </span>
                            </div>
                            <span className="text-base sm:text-xl font-bold text-gray-800 truncate">
                                {siteConfig.name || 'TechBlog'}
                            </span>
                        </Link>

                        {/* ✅ 关键2：导航紧跟 Logo，不居中 */}
                        <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
                            {NAV_ITEMS.map((item) => {
                                const active = isNavActive(pathname, item);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'px-3 xl:px-4 py-2 rounded-lg text-base xl:text-lg font-medium transition-all duration-200',
                                            active
                                                ? 'bg-primary-50 text-primary-700 shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* ==================== 右侧：操作区 ==================== */}
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        {/* 搜索按钮 */}
                        <button
                            onClick={() => {
                                setIsSearchOpen(!isSearchOpen);
                                if (!isSearchOpen) {
                                    setTimeout(() => searchInputRef.current?.focus(), 100);
                                }
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="搜索"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* RSS */}
                        <a
                            href="/rss.xml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex p-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                            title="RSS 订阅"
                            aria-label="RSS 订阅"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                            </svg>
                        </a>

                        {/* 登录/用户菜单 */}
                        {isLoggedIn ? (
                            <Link
                                href="/member"
                                className="hidden sm:flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <img
                                    src={user?.avatar || '/img/avatar-default.png'}
                                    alt={user?.nickname || user?.username || '用户'}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                                    {user?.nickname || user?.username}
                                </span>
                            </Link>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-1">
                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    登录
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
                                >
                                    注册
                                </Link>
                            </div>
                        )}

                        {/* 汉堡按钮 */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="菜单"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================== 搜索展开 ==================== */}
            {isSearchOpen && (
                <div className="border-t border-gray-200 bg-white animate-fade-in">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="搜索文章、标签、作者..."
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* ==================== 移动端菜单（绝对定位，不遮挡） ==================== */}
            {isMobileMenuOpen && (
                <>
                    {/* ✅ 关键1：遮罩用 fixed inset-0，但通过 z-index 层级避免遮挡 */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* ✅ 关键2：抽屉用 absolute top-full，相对 header 底部 */}
                    <div className="lg:hidden absolute top-full left-0 right-0 bg-white z-50 overflow-y-auto animate-slide-down max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] shadow-lg">
                        <div className="p-4 space-y-1">
                            {/* 导航菜单 */}
                            {NAV_ITEMS.map((item) => {
                                const active = isNavActive(pathname, item);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            'flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                            active
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        )}
                                    >
                                        {item.icon && <span className="text-lg">{item.icon}</span>}
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            {/* 分割线 */}
                            <div className="pt-2 mt-2 border-t border-gray-100">
                                {/* RSS */}
                                <a
                                    href="/rss.xml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                                    </svg>
                                    <span>RSS 订阅</span>
                                </a>

                                {/* 用户区 */}
                                {isLoggedIn ? (
                                    <>
                                        <Link
                                            href="/member"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <img
                                                src={user?.avatar || '/img/avatar-default.png'}
                                                alt={user?.nickname || user?.username || '用户'}
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                            <span>会员中心</span>
                                        </Link>

                                        {user?.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>管理后台</span>
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>退出登录</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>登录</span>
                                        </Link>

                                        <Link
                                            href="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            <span>注册</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}