// types/frontend.ts

// ========== 文章筛选 ==========

export interface ArticleFilters {
    category: string;
    tag: string;
    sort: 'latest' | 'popular' | 'oldest' | 'liked';
    search: string;
    page: number;
    limit: number;
}
export interface ButtonProps {
    label: string;
    key?: string;
    className?: string;
    onClick?: () => void;
}
// ========== 文章 ==========
/*
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
*/
export interface FrontendArticle1 {
    id: number;
    cid: number;
    subCid: string;
    title: string;
    shortTitle: string;
    tagId: string;
    attr: string;
    articleView: string;
    source: string;
    author: { name: string; avatar: string; };
    description: string;
    img: string;
    content: string;
    status: number;
    pv: number;
    link: string;
    createdAt: string;
    Category: Category1;
    updatedAt: string;
    readTime: number;
    likes: number;
    tags: { id: number; name: string; path: string; }[];
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

export interface TableOfContentsItem {
    id: string;
    title: string;
    level: number;
};
// ========== 文章详情 ==========

export interface ArticleDetail extends FrontendArticle1 {
    content: string;
    comments: Comment[];
    tableOfContents?: TableOfContentsItem[];
    /*tableOfContents?: {
        id: string;
        title: string;
    }[];*/
    /*
    id: number;
    cid: number;
    subCid: string;
    title: string;
    shortTitle: string;
    tagId: string;
    attr: string;
    articleView: string;
    source: string;
    author: { name: string; avatar: string; };
    description: string;
    img: string;
    content: string;
    status: number;
    pv: number;
    link: string;
    createdAt: string;
    category: Category1;
    updatedAt: string;
    readTime: number;
    likes: number;
    tags: { id: number; name: string; }[];
    featured?: boolean;
    */
}

// ========== 分类 ==========

/*export interface Category {
    id: number;
    name: string;
    slug: string;
    count: number;
    icon: string;
}*/
export interface Category1 {
    id: number;
    pid: number;
    seoTitle: string;
    seoKeywords: string;
    seoDescription: string;
    name: string;
    pinyin: string;
    path: string;
    description: string;
    type: string;
    url: string;
    orderBy: number;
    target: string;
    status: string;
    mid: string;
    listView: string;
    articleView: string;
    createdAt: string;
    updatedAt: string;
    count: number;
    icon: string;
    platform: string;
}
// ========== 标签 ==========


export interface Tag {
    id: number;
    name: string;
    path: string;
    count: number;
    articleCount: number;
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
/*
export interface SiteInfo1 {
    name: string;
    description: string;
    logo: string;
    socialLinks: {
        github?: string;
        twitter?: string;
        weibo?: string;
        email?: string;
    };
}*/
export interface FragInfo {
    id: number;
    name: string;
    mark: string;
    content: string;
    type: number;
    createdAt: string;
    updatedAt: string;
}
export interface SiteInfo {
    id: number;
    name: string;
    domain: string;
    wx: string;
    icp: string;
    code: string;
    json: {
        logo: string;
        github?: string;
        twitter?: string;
        weibo?: string;
        email: string;
    };
    title: string;
    keywords: string;
    description: string;
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

export const defaultSiteInfo: SiteInfo = {
    id: 0,
    name: '',
    domain: '',
    wx: '',
    icp: '',
    code: '',
    json: {
        logo: '',
        email: '',
    },
    title: '',
    keywords: '',
    description: '',
};
export const defaultFragInfo: FragInfo = {
    id: 0,
    name: '',
    mark: '',
    content: '',
    type: 1,
    createdAt: '',
    updatedAt: '',
};

export const defaultCategory: Category1 = {
    id: 0,
    pid: 0,
    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',
    name: '',
    pinyin: '',
    path: '',
    description: '',
    type: '',
    url: '',
    orderBy: 0,
    target: '',
    status: '',
    mid: '',
    listView: '',
    articleView: '',
    createdAt: '',
    updatedAt: '',
    count: 0,
    icon: '',
    platform: ''
};
export const defaultArticle: FrontendArticle1 = {
    id: 0,
    cid: 0,
    subCid: '',
    title: '',
    shortTitle: '',
    tagId: '',
    attr: '',
    articleView: '',
    source: '',
    author: { name: '', avatar: '', },
    description: '',
    img: '',
    content: '',
    status: 0,
    pv: 0,
    link: '',
    createdAt: '',
    Category: defaultCategory,
    updatedAt: '',
    readTime: 0,
    likes: 0,
    tags: [],
    featured: false
}
export const defaultArticleDetail: Partial<ArticleDetail> = { //ArticleDetail = {
    content: '',
    comments: [],
    tableOfContents: []
}