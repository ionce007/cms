// app/page.tsx
import { headers } from 'next/headers';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import HeroSection from '@/components/frontend/HeroSection';
import ArticleList from '@/components/frontend/ArticleList';
import Sidebar from '@/components/frontend/Sidebar';
import { defaultArticle, FrontendArticle1 } from '@/types/frontend';
import { getBaseUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

async function getApiBaseUrl() {
    const headersList = await headers();
    return getBaseUrl(headersList);
}

async function getFeaturedArticles(): Promise<FrontendArticle1 | null> {
    //const baseUrl = await getApiBaseUrl();
    const url = `${baseUrl}/articles/pinned`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        console.log('Featured Articles response.ok is false, status = ', response.status);
        return defaultArticle;
    }

    const json = await response.json();
    const article: FrontendArticle1 = { ...json.data, Category: json.data.category || (json.data as any).Category, Tags: json.data.tags }
    //const data = Array.isArray(json.data) ? json.data : ;
    return article;//json.data ?? defaultArticle;
}

async function getRecentArticles(): Promise<FrontendArticle1[]> {
    //const baseUrl = await getApiBaseUrl();
    const url = `${baseUrl}/articles/recent`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        console.log('Recent Articles response.ok is ', response.status);
        return [];
    }

    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
}

export default async function FrontendHome() {
    const featuredArticle = await getFeaturedArticles();
    /*const featured = {
        ...featuredArticle, tags: featuredArticle?.tags.map(t => ({
            id: t.id,
            name: t.name,
            path: t.path,
        }))
    }*/
    const recentArticles = await getRecentArticles();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                <HeroSection article={featuredArticle ?? null} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <ArticleList articles={recentArticles} />
                        </div>
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}