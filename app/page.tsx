// app/page.tsx
import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { getSiteConfig } from '@/lib/siteConfig';

// ✅ 用 generateMetadata 代替 metadata
export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();

    return {
        title: {
            default: `${siteConfig.name} - ${siteConfig.title}`,
            template: `%s - %s | ${siteConfig.name} | ${siteConfig.title}`,
        },
        description: siteConfig.description,
        keywords: siteConfig.keywords,
        authors: [{ name: siteConfig.name }],
        openGraph: {
            title: `${siteConfig.name} - ${siteConfig.title}`,
            description: siteConfig.description,
            type: 'website',
            siteName: siteConfig.name,
        },
        twitter: {
            card: 'summary_large_image',
            title:`${siteConfig.name} - ${siteConfig.title}`,
            description: siteConfig.description,
        },
    };
}

/*export const metadata: Metadata = {
    title: 'TechBlog - 技术博客',
    description: '分享技术知识，记录开发心得，探索前沿科技',
    keywords: ['技术博客', '前端开发', 'React', 'Next.js', 'TypeScript'],
    openGraph: {
        title: 'TechBlog - 技术博客',
        description: '分享技术知识，记录开发心得',
        type: 'website',
    },
};*/

export default function FrontendHome() {
    return <HomeClient />;
}