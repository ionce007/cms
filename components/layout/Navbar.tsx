'use client';

import { useState, useRef, useEffect } from 'react';
import { NavbarProps } from '@/types';
import { cn } from '@/lib/utils';
import { mockNotifications } from '@/data/mockData';

export default function Navbar({
    onToggleSidebar,
    onToggleMobileMenu,
    mobileMenuOpen,
}: NavbarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { label: '仪表盘', path: '/', active: true },
        { label: '内容', path: '/content', active: false },
        { label: '媒体', path: '/media', active: false },
        { label: '用户', path: '/users', active: false },
        { label: '设置', path: '/settings', active: false },
    ];

    const unreadCount = mockNotifications.filter(n => !n.read).length;

    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowSearch(true);
            }
            if (e.key === 'Escape') {
                setShowSearch(false);
                setShowNotifications(false);
                setShowUserMenu(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* 左侧：Logo 和导航 */}
                    <div className="flex items-center space-x-4">
                        {/* 移动端菜单按钮 */}
                        <button
                            onClick={onToggleMobileMenu}
                            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>

                        {/* 桌面端侧边栏切换 */}
                        <button
                            onClick={onToggleSidebar}
                            className="hidden lg:block p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                                CMS<span className="text-primary-600">Pro</span>
                            </h1>
                        </div>

                        {/* 桌面端导航 */}
                        <div className="hidden lg:flex items-center space-x-1 ml-8">
                            {navItems.map((item, index) => (
                                <button
                                    key={index}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                        item.active
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 右侧：搜索、通知、用户 */}
                    <div className="flex items-center space-x-2">
                        {/* 搜索 */}
                        <div className="relative">
                            {showSearch ? (
                                <div className="flex items-center">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="搜索内容... (Ctrl+K)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onBlur={() => !searchTerm && setShowSearch(false)}
                                        className="w-48 lg:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setShowSearch(false);
                                            }}
                                            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowSearch(true)}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    aria-label="Search"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* 通知 */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setShowUserMenu(false);
                                }}
                                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                aria-label="Notifications"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium ring-2 ring-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* 通知下拉菜单 */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-800">通知</h3>
                                            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                                全部已读
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {mockNotifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                                                    !notification.read && 'bg-blue-50/50'
                                                )}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={cn(
                                                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                                        notification.type === 'info' && 'bg-blue-100 text-blue-600',
                                                        notification.type === 'success' && 'bg-green-100 text-green-600',
                                                        notification.type === 'warning' && 'bg-yellow-100 text-yellow-600',
                                                        notification.type === 'error' && 'bg-red-100 text-red-600'
                                                    )}>
                                                        {notification.type === 'info' && '💬'}
                                                        {notification.type === 'success' && '✅'}
                                                        {notification.type === 'warning' && '⚠️'}
                                                        {notification.type === 'error' && '❌'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-gray-100 text-center">
                                        <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                                            查看所有通知
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 用户菜单 */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                    setShowNotifications(false);
                                }}
                                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                                    管
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-sm font-medium text-gray-700 leading-tight">管理员</div>
                                    <div className="text-xs text-gray-500 leading-tight">admin@cms.pro</div>
                                </div>
                                <svg className={cn(
                                    'w-4 h-4 text-gray-400 transition-transform duration-200',
                                    showUserMenu && 'rotate-180'
                                )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* 用户下拉菜单 */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-800">管理员</p>
                                        <p className="text-xs text-gray-500">admin@cms.pro</p>
                                    </div>
                                    {[
                                        { label: '个人资料', icon: '👤' },
                                        { label: '账号设置', icon: '⚙️' },
                                        { label: '帮助中心', icon: '❓' },
                                    ].map((item, index) => (
                                        <button
                                            key={index}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                                            <span>🚪</span>
                                            <span>退出登录</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}