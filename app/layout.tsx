// app/layout.tsx
import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/siteConfig';
import { SITE_URL } from '@/config/env';
import '@/public/css/globals.css';

export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();

    return {
        title: {
            default: siteConfig.name,
            template: `%s | ${siteConfig.name}`,
        },
        description: siteConfig.description,
        keywords: siteConfig.keywords,
        openGraph: {
            title: siteConfig.name,
            description: siteConfig.description,
            siteName: siteConfig.name,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: siteConfig.name,
            description: siteConfig.description,
        },
        alternates: {
            canonical: SITE_URL,
            types: {
                'application/rss+xml': `${SITE_URL}/rss.xml`,
            },
        },
    };
}

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <html lang="zh-CN">
            <body>{children}</body>
        </html>
    );
}