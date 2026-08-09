'use client';

import { useState } from 'react';
import { SidebarProps, MenuItem } from '@/types';
import { cn } from '@/lib/utils';
import { menuItems } from '@/data/mockData';

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
    const [activeMenu, setActiveMenu] = useState('dashboard');

    const mainMenus = menuItems.filter(item => item.section === 'main');
    const systemMenus = menuItems.filter(item => item.section === 'system');

    const renderMenuItem = (item: MenuItem) => (
        <li key={item.id}>
            <button
                onClick={() => setActiveMenu(item.id)}
                className={cn(
                    'sidebar-item group',
                    activeMenu === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive',
                    collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
            >
                <span className="text-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    {item.icon}
                </span>
                {!collapsed && (
                    <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                            <span className={cn(
                                'badge',
                                activeMenu === item.id
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-gray-100 text-gray-600'
                            )}>
                                {item.badge > 99 ? '99+' : item.badge}
                            </span>
                        )}
                    </>
                )}
            </button>
        </li>
    );

    return (
        <>
            {/* 移动端遮罩 */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in backdrop-blur-sm"
                    onClick={onCloseMobile}
                />
            )}

            {/* 侧边栏 */}
            <aside
                className={cn(
                    'fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 z-40',
                    'transition-all duration-300 overflow-y-auto scrollbar-thin',
                    collapsed ? 'w-16' : 'w-64',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="p-4">
                    {/* 快速操作按钮 */}
                    {!collapsed && (
                        <div className="mb-6">
                            <button className="btn-primary w-full flex items-center justify-center space-x-2">
                                <span>✨</span>
                                <span>创建新内容</span>
                            </button>
                        </div>
                    )}

                    {/* 导航菜单 */}
                    <nav className="space-y-6">
                        {/* 主菜单 */}
                        <div>
                            {!collapsed && (
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    主菜单
                                </div>
                            )}
                            <ul className="space-y-1">
                                {mainMenus.map(renderMenuItem)}
                            </ul>
                        </div>

                        {/* 系统菜单 */}
                        <div>
                            {!collapsed && (
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    系统
                                </div>
                            )}
                            <ul className="space-y-1">
                                {systemMenus.map(renderMenuItem)}
                            </ul>
                        </div>
                    </nav>

                    {/* 存储信息 */}
                    {!collapsed && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">存储空间</span>
                                <span className="text-xs text-primary-600 font-semibold">65%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: '65%' }}
                                />
                            </div>
                            <div className="text-xs text-gray-500">
                                23.5 GB / 50 GB
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}