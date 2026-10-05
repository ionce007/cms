// app/rss.xml/route.ts
import { NextResponse } from 'next/server';
import { API_BASE_URL, SITE_URL } from '@/config/env';
import { getSiteConfig } from '@/lib/siteConfig';  // ✅ 服务端函数
import { generateRSS } from '@/lib/rss';

// ✅ 每小时重新生成
export const revalidate = 3600;

// app/rss.xml/route.ts

export async function GET(request: Request) {
    const siteConfig = await getSiteConfig();  // ✅ 可以 await
    // ✅ 支持分类订阅
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'articles';
    const category = searchParams.get('category');

    try {
        let items: any[] = [];
        let title = siteConfig.name;
        let description = siteConfig.description;

        if (type === 'articles') {
            // 文章 RSS
            const params = new URLSearchParams();
            if (category) params.append('category', category);

            const res = await fetch(
                `${API_BASE_URL}/articles/recent?${params}`,
                { next: { revalidate: 3600 } }
            );

            if (res.ok) {
                const data = await res.json();
                const articles = Array.isArray(data.data) ? data.data : [];
                items = articles.map((a: any) => ({
                    title: a.title,
                    link: `${SITE_URL}/articles/${a.id}`,
                    description: a.excerpt || a.description || '',
                    pubDate: a.createdAt,
                    author: a.author?.name,
                    category: a.category?.name,
                }));
            }

            if (category) {
                title = `${siteConfig.name} - ${category}`;
                description = `${category} 分类的文章`;
            }
        } else if (type === 'downloads') {
            // 下载 RSS
            const res = await fetch(`${API_BASE_URL}/formulas?limit=50`, {
                next: { revalidate: 3600 },
            });

            if (res.ok) {
                const data = await res.json();
                const formulas = Array.isArray(data.data) ? data.data : [];
                items = formulas.map((f: any) => ({
                    title: f.server_filename,
                    link: `${SITE_URL}/downloads/${f.fs_id}`,
                    description: f.summary || '',
                    pubDate: new Date(f.server_ctime * 1000).toISOString(),
                }));
            }

            title = `${siteConfig.name} - 下载`;
            description = '最新文件下载';
        }

        const rss = generateRSS({
            title,
            link: SITE_URL,
            description,
            language: 'zh-CN',
            copyright: `© ${new Date().getFullYear()} ${siteConfig.name}`,
            items,
        });

        return new NextResponse(rss, {
            status: 200,
            headers: {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('RSS 生成失败:', error);
        const rss = generateRSS({
            title: siteConfig.name,
            link: SITE_URL,
            description: siteConfig.description,
            items: [],
        });
        return new NextResponse(rss, {
            status: 200,
            headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
        });
    }
}