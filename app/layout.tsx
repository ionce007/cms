// app/layout.tsx
import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/siteConfig';
import { SITE_URL } from '@/config/env';
import BaiduAnalytics from '@/components/frontend/BaiduAnalytics';
import { AuthProvider } from '@/contexts/AuthContext';
// ✅ 1. 引入我们封装的 LightboxProvider
import { LightboxProvider } from '@/components/frontend/ImageLightbox';
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
            <body>
                <AuthProvider>
                    {/* ✅ 2. 将 LightboxProvider 包裹在应用最外层（或包裹 children） */}
                    <LightboxProvider>
                        {children}
                    </LightboxProvider>
                </AuthProvider>
                <BaiduAnalytics />
            </body>
        </html>
    );
}