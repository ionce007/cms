// app/member/components/MemberSidebar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
    { key: 'overview', label: '概览', icon: '📊', href: '/member' },
    { key: 'likes', label: '我的点赞', icon: '❤️', href: '/member/likes' },
    { key: 'bookmarks', label: '我的收藏', icon: '🔖', href: '/member/bookmarks' },
    { key: 'downloads', label: '我的下载', icon: '📥', href: '/member/downloads' },
    { key: 'comments', label: '我的评论', icon: '💬', href: '/member/comments' },
    { key: 'password', label: '修改密码', icon: '🔒', href: '/member/password' },
    { key: 'settings', label: '个人设置', icon: '⚙️', href: '/member/settings' },
];

interface MemberSidebarProps {
    /** 横向模式（窄屏 Tab） */
    horizontal?: boolean;
}

export default function MemberSidebar({ horizontal = false }: MemberSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        if (!confirm('确定要退出登录吗？')) return;
        try {
            await logout();
        } catch (err) {
            console.error('登出失败:', err);
        }
        router.push('/');
    };
    const isActive = (href: string) =>
        href === '/member' ? pathname === '/member' : pathname.startsWith(href);

    // ✅ 横向模式
    if (horizontal) {
        return (
            <nav className="flex gap-2 pb-1">
                {MENU_ITEMS.map(item => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap',
                                'transition-colors flex-shrink-0',
                                active
                                    ? 'bg-primary-600 text-white font-medium shadow-sm'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            )}
                        >
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        );
    }

    // 垂直模式
    return (
        <aside className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-800">会员菜单</h3>
            </div>
            <nav className="p-2">
                <ul className="space-y-1">
                    {MENU_ITEMS.map(item => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.key}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                                        active
                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            {/* ✅ 底部登出按钮 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
                     text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                    <span className="text-base">🚪</span>
                    <span>退出登录</span>
                </button>
            </div>
        </aside>
    );
}