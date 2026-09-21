// app/page.tsx
import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
    title: 'TechBlog - 技术博客',
    description: '分享技术知识，记录开发心得，探索前沿科技',
    keywords: ['技术博客', '前端开发', 'React', 'Next.js', 'TypeScript'],
    openGraph: {
        title: 'TechBlog - 技术博客',
        description: '分享技术知识，记录开发心得',
        type: 'website',
    },
};

export default function FrontendHome() {
    return <HomeClient />;
}