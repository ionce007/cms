// ========== 基础类型 ==========
export type ContentStatus = 'published' | 'draft' | 'archived';
export type MediaType = 'image' | 'video' | 'document' | 'audio';
export type UserRole = 'Admin' | 'Editor' | 'User' | 'Moderator';
export type StatColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';
export type ChangeType = 'increase' | 'decrease';

// ========== 数据模型 ==========
export interface Article {
    id: number;
    title: string;
    category: string;
    author: string;
    date: string;
    views: number;
    status: ContentStatus;
    excerpt?: string;
    tags?: string[];
    coverImage?: string;
    readTime?: number;
}

export interface Media {
    id: number;
    title: string;
    type: MediaType;
    size: string;
    date: string;
    dimensions?: string;
    duration?: string;
    pages?: number;
    url?: string;
    thumbnail?: string;
}

export interface User {
    id: number;
    title: string;
    role: UserRole;
    count: number;
    lastActive: string;
    avatar?: string;
    email?: string;
}

export interface Setting {
    id: number;
    title: string;
    description: string;
    icon?: string;
    path?: string;
    category?: string;
}

export interface ContentSection {
    id: number;
    title: string;
    icon: string;
    type: 'article' | 'media' | 'user' | 'setting';
    items: Article[] | Media[] | User[] | Setting[];
    description?: string;
}

export interface StatData {
    label: string;
    value: string;
    change: number;
    changeType: ChangeType;
    color: StatColor;
    icon: string;
    trend?: number[];
}

export interface MenuItem {
    id: string;
    icon: string;
    label: string;
    badge?: number;
    section: 'main' | 'system' | 'other';
    path?: string;
}

export interface NavItem {
    label: string;
    path: string;
    active: boolean;
    icon?: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
}

// ========== 组件 Props ==========
export interface NavbarProps {
    onToggleSidebar: () => void;
    onToggleMobileMenu: () => void;
    mobileMenuOpen: boolean;
    notifications?: Notification[];
}

export interface SidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

export interface FooterProps {
    sidebarCollapsed: boolean;
}

export interface StatCardProps {
    stat: StatData;
    index?: number;
}

export interface ContentSectionProps {
    section: ContentSection;
}

export interface ArticleCardProps {
    article: Article;
}

export interface MediaCardProps {
    media: Media;
}

export interface UserCardProps {
    user: User;
}

export interface SettingCardProps {
    setting: Setting;
}

export interface QuickActionsProps {
    onCreateContent: () => void;
    onViewAnalytics: () => void;
    onManageUsers: () => void;
}