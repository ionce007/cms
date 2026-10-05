// app/robots.ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/env';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',      // 管理后台
                    '/api/',        // API 接口
                    '/_next/',      // Next.js 内部
                ],
            },
            {
                // ✅ 允许爬虫抓取 RSS
                userAgent: '*',
                allow: ['/rss.xml', '/sitemap.xml'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}