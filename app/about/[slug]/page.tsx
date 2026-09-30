// app/about/page.tsx
import type { Metadata } from 'next';
import AboutChildClient from './AboutChildClient';

interface AboutPageProps {
    params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
    title: '关于我们',
    description: '了解 TechBlog 的团队、技术栈和发展历程',
};

export default async function AboutChildPage({ params }: AboutPageProps) {
    console.log('AboutChildPage')
    const { slug } = await params;
    let pageParam = 'aboutus'
    if (slug) {
        if (slug.trim().toLocaleLowerCase() === 'page-46.html') pageParam = 'donate'
        else if (slug.trim().toLocaleLowerCase() === 'page-47.html') pageParam = 'gratitude'
    }
    return <AboutChildClient slug={pageParam} />;
}