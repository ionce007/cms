// config/routes.ts

/**
 * 前端路由
 */
export const ROUTES = {
    HOME: '/',
    ARTICLES: '/articles',
    ARTICLE_DETAIL: (id: number | string) => `/articles/${id}`,
    CATEGORIES: '/categories',
    CATEGORY_DETAIL: (slug: string) => `/category/${slug}`,
    CATEGORY_ARTICLE: (slug: string, id: number | string) => `/category/${slug}/articles/${id}`,
    TAGS: '/tags',
    TAG_DETAIL: (slug: string) => `/tag/${slug}`,
    TAG_ARTICLE: (slug: string, id: number | string) => `/tag/${slug}/articles/${id}`,
    ABOUT: '/about',
    DOWNLOADS: '/downloads',
    DOWNLOAD_DETAIL: (id: number | string) => `/downloads/${id}`,
} as const;

/**
 * 管理后台路由
 */
export const ADMIN_ROUTES = {
    DASHBOARD: '/admin',
    CONTENT: '/admin/content',
    MEDIA: '/admin/media',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
} as const;

/**
 * API 端点
 */
export const API_ENDPOINTS = {
    // 文章
    ARTICLES: '/articles',
    ARTICLE_DETAIL: (id: number | string) => `/articles/${id}`,
    ARTICLES_PINNED: '/articles/pinned',
    ARTICLES_RECENT: '/articles/recent',
    ARTICLES_POPULAR: '/articles/popular',
    ARTICLES_FEATURED: '/articles/featured',
    ARTICLES_BY_CATEGORY: '/articles/category',
    ARTICLES_BY_TAG: '/articles/tag',
    ARTICLES_SEARCH: '/articles/search',
    ARTICLE_RELATED: (id: number | string) => `/articles/${id}/related`,

    // 分类
    CATEGORIES: '/categories',

    // 标签
    TAGS: '/tags',

    // 图片代理
    PROXY_IMAGE: '/imgproxy',

    // 关于页
    FRAGS: '/frags',
    FRAG_BY_MARK: (mark: string) => `/frags/${mark}`,

    FORMULAS: '/formulas',
    FORMULA_DETAIL: (id: number | string) => `/formulas/${id}`,
} as const;