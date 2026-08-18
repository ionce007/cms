// types/frontend.ts

// ========== 文章筛选 ==========

export interface ArticleFilters {
    category: string;
    tag: string;
    sort: 'latest' | 'popular' | 'oldest';
    search: string;
}

// ========== 文章 ==========

export interface FrontendArticle {
    id: number;
    title: string;
    excerpt: string;
    coverImage: string;
    author: {
        name: string;
        avatar: string;
    };
    category: string;
    categorySlug: string;
    tags: string[];
    publishDate: string;
    readTime: number;
    views: number;
    likes: number;
    featured?: boolean;
}

// ========== 评论 ==========

export interface Comment {
    id: number;
    articleId: number;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    date: string;
    likes: number;
    replies?: Comment[];
}

// ========== 文章详情 ==========

export interface ArticleDetail extends FrontendArticle {
    content: string;
    comments: Comment[];
    tableOfContents?: {
        id: string;
        title: string;
    }[];
}

// ========== 分类 ==========

export interface Category {
    id: number;
    name: string;
    slug: string;
    count: number;
    icon: string;
}

// ========== 标签 ==========

export interface Tag {
    id: number;
    name: string;
    slug: string;
    count: number;
}

// ========== 热门文章 ==========

export interface PopularPost {
    id: number;
    title: string;
    date: string;
    views: number;
    thumbnail?: string;
}

// ========== 网站信息 ==========

export interface SiteInfo {
    name: string;
    description: string;
    logo: string;
    socialLinks: {
        github?: string;
        twitter?: string;
        weibo?: string;
        email?: string;
    };
}

// ========== 分页信息 ==========

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

// ========== 导航项 ==========

export interface NavItem {
    label: string;
    path: string;
    active: boolean;
    icon?: string;
}