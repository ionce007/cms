// components/frontend/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 路由变化时关闭移动端菜单
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const navItems = [
        { label: '首页', href: '/', active: pathname === '/' },
        { label: '文章', href: '/articles', active: pathname.startsWith('/articles') },
        { label: '分类', href: '/categories', active: pathname.startsWith('/categories') },
        { label: '标签', href: '/tags', active: pathname.startsWith('/tags') },
        { label: '关于', href: '/about', active: pathname === '/about' },
    ];

    return (
        <header
            className={cn(
                'sticky top-0 z-50 transition-all duration-300',
                isMounted && isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60'
                    : 'bg-white border-b border-gray-200'
            )}
        >
            <div className="/*max-w-7xl*/ mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 左侧：Logo + 桌面端导航 */}
                    <div className="flex items-center space-x-3">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="text-xl font-bold text-gray-800">
                                Tech<span className="text-primary-600">Blog</span>
                            </span>
                        </Link>

                        {/* 桌面端导航 */}
                        <nav className="hidden lg:flex items-center space-x-1 ml-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-lg font-medium transition-all duration-200',
                                        item.active
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* 右侧：搜索 + 订阅 + 汉堡按钮 */}
                    <div className="flex items-center space-x-1 sm:space-x-3">
                        {/* 搜索 */}
                        <div className="relative">
                            {isSearchOpen ? (
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        placeholder="搜索..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onBlur={() => !searchTerm && setIsSearchOpen(false)}
                                        className="w-32 sm:w-48 lg:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                    aria-label="搜索"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* 订阅按钮 - 移动端隐藏 */}
                        <button className="hidden md:inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>订阅</span>
                        </button>

                        {/* 移动端汉堡按钮 - 最右侧 */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 -mr-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                            aria-label="打开菜单"
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

            {/* 移动端下拉菜单 */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg animate-fade-in">
                    <div className="px-4 py-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                    item.active
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* 移动端订阅按钮 */}
                        <div className="pt-3 mt-3 border-t border-gray-100">
                            <button className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                                📧 订阅更新
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}