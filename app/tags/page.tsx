// app/tags/page.tsx
import { Metadata } from 'next';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import TagList from '@/components/frontend/TagList';
//import TagCloud from '@/components/frontend/TagCloud';
//import Sidebar from '@/components/frontend/Sidebar';
//import { tags } from '@/data/articlesData';
//import { allArticles } from '@/data/articlesData';

export const metadata: Metadata = {
    title: '热门标签',
    description: '浏览所有热门标签，快速找到你感兴趣的内容',
};

export default function TagsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <TagList />

            <Footer />
        </div>
    );
}