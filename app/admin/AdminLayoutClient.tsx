// app/admin/AdminLayoutClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { usePermission } from '@/hooks/usePermission';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import {
    LayoutDashboard, FolderTree, Tags, FileText, Download,
    MessageSquare, Heart, Puzzle, Shield, Users, Key,
    Settings, RefreshCw, BarChart3, Activity, Bell, Menu, X,
    ChevronLeft, ChevronDown, Search, LogOut, Loader2
} from 'lucide-react';

// ============ 菜单配置 ============
const MENU_ITEMS = [
    {
        group: '概览',
        items: [
            { key: 'dashboard', name: '数据仪表盘', href: '/admin', icon: LayoutDashboard },
        ]
    },
    {
        group: '内容管理',
        items: [
            { key: 'categories', name: '栏目管理', href: '/admin/contents/categories', icon: FolderTree },
            { key: 'articles', name: '文章管理', href: '/admin/contents/articles', icon: FileText },
            { key: 'tags', name: '标签管理', href: '/admin/contents/tags', icon: Tags },
            { key: 'formulas', name: '下载公式', href: '/admin/contents/formulas', icon: Download },
            { key: 'frags', name: '碎片信息', href: '/admin/contents/frags', icon: Puzzle },
        ]
    },
    {
        group: '互动管理',
        items: [
            { key: 'comments', name: '评论管理', href: '/admin/interact/comments', icon: MessageSquare },
            { key: 'likes', name: '点赞/收藏', href: '/admin/interact/likes', icon: Heart },
            { key: 'downloads', name: '下载管理', href: '/admin/interact/downloads', icon: Download },
        ]
    },
    {
        group: '会员管理',
        items: [
            { key: 'members', name: '会员管理', href: '/admin/members', icon: Users },
        ]
    },
    {
        group: '系统管理',
        items: [
            { key: 'users', name: '系统用户', href: '/admin/system/users', icon: Shield },
            { key: 'roles', name: '角色权限', href: '/admin/system/roles', icon: Key },
            { key: 'settings', name: '系统设置', href: '/admin/system/settings', icon: Settings },
            { key: 'bdpan', name: '网盘授权', href: '/admin/system/bdpan', icon: RefreshCw },
            { key: 'tongji', name: '统计授权', href: '/admin/system/tongji', icon: BarChart3 },
            { key: 'logs', name: '日志管理', href: '/admin/system/logs', icon: Activity },
        ]
    },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const { hasPermission } = usePermission();
    const pathname = usePathname();
    const router = useRouter();
    const { isAdminLoggedIn, isLoading, adminUser, adminLogout } = useAdminAuth();
    const { adminFetch } = useAdminFetch();

    // ============ 状态 ============
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // ✅ 全局搜索状态
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ✅ 过滤菜单：如果是 super 角色全部显示；否则只要该模块有权限数组（非空），就显示
    const filteredMenuItems = MENU_ITEMS.map(group => {
        const allowedItems = group.items.filter(item => {
            if (adminUser?.role === 'super' || hasPermission(item.key, 'view')) return true;
            const modulePerms = adminUser?.permissions?.[item.key];
            return modulePerms && modulePerms.length > 0;
        });
        return { ...group, items: allowedItems };
    }).filter(group => group.items.length > 0);

    // 记录当前展开的菜单组（手风琴模式）
    const [openGroup, setOpenGroup] = useState<string>('概览');

    // 路由拦截：未登录且不在登录页，跳转到登录页
    useEffect(() => {
        if (!isLoading && !isAdminLoggedIn && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
    }, [isAdminLoggedIn, isLoading, pathname, router]);

    // 路由变化时，自动展开包含当前路径的菜单组，并关闭移动端菜单
    useEffect(() => {
        setIsMobileOpen(false);
        setShowUserMenu(false);
        setShowNotifications(false);

        const currentGroup = MENU_ITEMS.find(group =>
            group.items.some(item =>
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            )
        );

        if (currentGroup) {
            setOpenGroup(currentGroup.group);
        }
    }, [pathname]);

    // ✅ 全局搜索：点击外部关闭下拉面板
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ 全局搜索：防抖处理
    useEffect(() => {
        if (!searchKeyword.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await adminFetch(`/admin/search?keyword=${encodeURIComponent(searchKeyword)}`);
                if (res.code === 1) {
                    setSearchResults(res.data || []);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error('搜索失败', err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchKeyword, adminFetch]);

    // ✅ 全局搜索：快捷键 Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setShowDropdown(!!searchKeyword);
            }
            if (e.key === 'Escape') {
                setShowDropdown(false);
                searchInputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchKeyword]);

    // 退出登录处理
    const handleLogout = () => {
        if (confirm('确定退出后台登录吗？')) {
            adminLogout();
            router.replace('/admin/login');
        }
    };

    // 切换组展开状态
    const toggleGroup = (groupName: string) => {
        if (isCollapsed) return;
        setOpenGroup(prev => prev === groupName ? '' : groupName);
    };

    // ============ 渲染拦截 ============
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">正在验证管理员身份...</p>
                </div>
            </div>
        );
    }

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!isAdminLoggedIn) {
        return null;
    }

    // ============ 正常渲染后台布局 ============
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* 移动端遮罩层 */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ==================== 左侧侧边栏 ==================== */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 bg-slate-900 text-slate-300 z-50 flex flex-col transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-16" : "w-64",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo 与 折叠按钮 */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
                    <Link href="/admin" className="flex items-center space-x-2 overflow-hidden">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-white font-bold text-lg whitespace-nowrap">后台管理</span>
                        )}
                    </Link>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                        <ChevronLeft className={cn("w-5 h-5 transition-transform duration-300", isCollapsed && "rotate-180")} />
                    </button>

                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 菜单列表 */}
                <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {filteredMenuItems.map((group) => {
                        const isOpen = openGroup === group.group;
                        const hasActiveItem = group.items.some(item =>
                            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                        );

                        // 折叠状态下，如果没有激活的子项，直接隐藏整个组
                        if (isCollapsed && !hasActiveItem) return null;

                        return (
                            <div key={group.group} className="mb-2">
                                {/* 组标题 */}
                                {!isCollapsed && (
                                    <button
                                        onClick={() => toggleGroup(group.group)}
                                        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                                    >
                                        <span className="uppercase tracking-wider">{group.group}</span>
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-transform duration-300",
                                            isOpen ? "rotate-180" : ""
                                        )} />
                                    </button>
                                )}

                                {/* ✅ 使用 Framer Motion 实现丝滑展开/收起 */}
                                <AnimatePresence initial={false}>
                                    {(isCollapsed || isOpen) && (
                                        <motion.div
                                            key={group.group}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <ul className="space-y-1 px-2 py-1">
                                                {group.items.map((item) => {
                                                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                                    return (
                                                        <li key={item.href}>
                                                            <Link
                                                                href={item.href}
                                                                className={cn(
                                                                    "flex items-center px-2 py-2.5 rounded-lg transition-all duration-200 group relative",
                                                                    isActive
                                                                        ? "bg-primary-600 text-white shadow-md shadow-primary-900/20"
                                                                        : "hover:bg-slate-800 hover:text-white",
                                                                    isCollapsed ? "justify-center" : "space-x-3"
                                                                )}
                                                                title={isCollapsed ? item.name : undefined}
                                                            >
                                                                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                                                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}

                                                                {isCollapsed && isActive && (
                                                                    <span className="absolute right-1 w-1.5 h-1.5 bg-white rounded-full" />
                                                                )}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* ==================== 右侧主体区 ==================== */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                    isCollapsed ? "lg:ml-16" : "lg:ml-64"
                )}
            >
                {/* 顶栏 */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* ✅ 全局搜索框与下拉面板 */}
                        <div className="relative hidden sm:block" ref={searchRef}>
                            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-transparent focus-within:border-primary-300 focus-within:bg-white transition-all w-64">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="全局搜索... (Ctrl+K)"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onFocus={() => { if (searchKeyword) setShowDropdown(true); }}
                                    className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full placeholder-gray-400 outline-none"
                                />
                                {isSearching && (
                                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin flex-shrink-0" />
                                )}
                            </div>

                            {/* 搜索结果下拉面板 */}
                            {showDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                                搜索结果
                                            </div>
                                            {searchResults.map((item, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        setSearchKeyword('');
                                                        setShowDropdown(false);
                                                        router.push(item.url);
                                                    }}
                                                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 flex-shrink-0">
                                                            {item.type}
                                                        </span>
                                                        <span className="text-sm text-gray-700 truncate group-hover:text-blue-600 transition-colors">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors rotate-180 flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="text-4xl mb-2 text-gray-200">🔍</div>
                                            <p className="text-sm text-gray-500">未找到关于 “{searchKeyword}” 的结果</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Link href="/" target="_blank" className="hidden md:flex items-center text-sm text-gray-500 hover:text-primary-600 font-medium transition-colors">
                            返回前台
                        </Link>

                        {/* 通知 */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                        <span className="font-semibold text-gray-800 text-sm">通知消息</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                                            <p className="text-sm font-medium text-gray-800">系统更新成功</p>
                                            <p className="text-xs text-gray-500 mt-1">欢迎使用 v2.0 版本。</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 用户菜单 */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                                className="flex items-center gap-2 p-1 pl-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                                    {adminUser?.username?.[0]?.toUpperCase() || 'A'}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700 pr-2">
                                    {adminUser?.username || 'Admin'}
                                </span>
                            </button>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{adminUser?.username}</p>
                                        <p className="text-xs text-gray-500 truncate">{adminUser?.roleName || '管理员'}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        退出登录
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* 页面内容 */}
                <main className="flex-1 p-4 lg:p-4 relative overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}