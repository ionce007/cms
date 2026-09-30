// config/navigation.ts

export interface NavItem {
    label: string;
    href: string;
    icon?: string;
    /** 是否精确匹配（用于 active 判断） */
    exact?: boolean;
}

/**
 * 顶部主导航菜单
 */
export const NAV_ITEMS: NavItem[] = [
    { label: '首页', href: '/', icon: '🏠', exact: true },
    { label: '文章', href: '/articles', icon: '📄' },
    { label: '分类', href: '/categories', icon: '📂' },
    { label: '标签', href: '/tags', icon: '🏷️' },
    { label: '下载', href: '/downloads', icon: '⬇️' },  
    { label: '关于', href: '/about', icon: 'ℹ️' },
];

/**
 * 管理后台导航
 */
export const ADMIN_NAV_ITEMS: NavItem[] = [
    { label: '仪表盘', href: '/admin', exact: true },
    { label: '内容', href: '/admin/content' },
    { label: '媒体', href: '/admin/media' },
    { label: '用户', href: '/admin/users' },
    { label: '设置', href: '/admin/settings' },
];

/**
 * 侧边栏菜单
 */
export const SIDEBAR_MENUS = [
    { id: 'dashboard', icon: '📊', label: '仪表盘', section: 'main' as const },
    { id: 'posts', icon: '📝', label: '文章管理', badge: 156, section: 'main' as const },
    { id: 'media', icon: '🖼️', label: '媒体库', badge: 234, section: 'main' as const },
    { id: 'users', icon: '👥', label: '用户管理', section: 'system' as const },
    { id: 'settings', icon: '⚙️', label: '系统设置', section: 'system' as const },
];

/**
 * 判断导航项是否激活
 */
export function isNavActive(pathname: string, item: NavItem): boolean {
    if (item.exact) {
        return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
}