// components/layout/Navbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mockNotifications } from '@/data/mockData';

export default function Navbar({
    onToggleSidebar,
    onToggleMobileMenu,
    mobileMenuOpen,
}: {
    onToggleSidebar: () => void;
    onToggleMobileMenu: () => void;
    mobileMenuOpen: boolean;
}) {
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // 动态导航项
    const navItems = [
        { label: '仪表盘', href: '/admin', active: pathname === '/admin' },
        { label: '内容', href: '/admin/content', active: pathname.startsWith('/admin/content') },
        { label: '媒体', href: '/admin/media', active: pathname.startsWith('/admin/media') },
        { label: '用户', href: '/admin/users', active: pathname.startsWith('/admin/users') },
        { label: '设置', href: '/admin/settings', active: pathname.startsWith('/admin/settings') },
    ];

    const unreadCount = mockNotifications.filter(n => !n.read).length;

    // ... 其余代码保持不变

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        {/* Logo */}
                        <Link href="/admin" className="flex items-center space-x-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                                CMS<span className="text-primary-600">Pro</span>
                            </h1>
                        </Link>

                        {/* 桌面端导航 */}
                        <div className="hidden lg:flex items-center space-x-1 ml-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                        item.active
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ... 其余代码保持不变 */}
                </div>
            </div>
        </nav>
    );
}