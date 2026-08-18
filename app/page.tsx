// app/page.tsx
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import HeroSection from '@/components/frontend/HeroSection';
import ArticleList from '@/components/frontend/ArticleList';
import Sidebar from '@/components/frontend/Sidebar';
import { articles } from '@/data/frontendData';
import { allArticles } from '@/data/articlesData'; 

export default function FrontendHome() {
    const featuredArticle = allArticles.find(a => a.featured);
    const recentArticles = allArticles.slice(0, 6);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
                {featuredArticle && <HeroSection article={featuredArticle} />}
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