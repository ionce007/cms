// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { API_BASE_URL, SITE_URL } from '@/config/env';

// ✅ 每小时重新生成
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // ✅ 静态页面
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/articles`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/categories`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/tags`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/downloads`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // ✅ 并行获取动态数据
    const [articles, categories, tags, formulas] = await Promise.all([
        // 文章
        fetch(`${API_BASE_URL}/articles/recent?limit=1000`, {
            next: { revalidate: 3600 },
        })
            .then(res => (res.ok ? res.json() : { data: [] }))
            .then(json => (Array.isArray(json.data) ? json.data : []))
            .catch(() => []),

        // 分类
        fetch(`${API_BASE_URL}/categories`, {
            next: { revalidate: 3600 },
        })
            .then(res => (res.ok ? res.json() : { data: [] }))
            .then(json => (Array.isArray(json.data) ? json.data : []))
            .catch(() => []),

        // 标签
        fetch(`${API_BASE_URL}/tags`, {
            next: { revalidate: 3600 },
        })
            .then(res => (res.ok ? res.json() : { data: [] }))
            .then(json => (Array.isArray(json.data) ? json.data : []))
            .catch(() => []),

        // 下载文件
        fetch(`${API_BASE_URL}/formulas?limit=1000`, {
            next: { revalidate: 3600 },
        })
            .then(res => (res.ok ? res.json() : { data: [] }))
            .then(json => (Array.isArray(json.data) ? json.data : []))
            .catch(() => []),
    ]);

    // ✅ 文章详情页
    const articleRoutes: MetadataRoute.Sitemap = articles.map((article: any) => ({
        url: `${SITE_URL}/articles/${article.id}`,
        lastModified: new Date(article.updatedAt || article.createdAt || now),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // ✅ 分类详情页
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat: any) => ({
        url: `${SITE_URL}/category/${cat.path || cat.pinyin}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // ✅ 标签详情页
    const tagRoutes: MetadataRoute.Sitemap = tags.map((tag: any) => ({
        url: `${SITE_URL}/tag/${tag.path}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }));

    // ✅ 下载详情页
    const downloadRoutes: MetadataRoute.Sitemap = formulas.map((formula: any) => ({
        url: `${SITE_URL}/downloads/${formula.fs_id}`,
        lastModified: new Date(formula.server_ctime * 1000 || now),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [
        ...staticRoutes,
        ...articleRoutes,
        ...categoryRoutes,
        ...tagRoutes,
        ...downloadRoutes,
    ];
}