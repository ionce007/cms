// app/categories/page.tsx
import { Metadata } from 'next';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import CategoryList from '@/components/frontend/CategoryList';
//import CategoryCard from '@/components/frontend/CategoryCard';
//import Sidebar from '@/components/frontend/Sidebar';
//import { categories } from '@/data/articlesData';
//import { allArticles } from '@/data/articlesData';

export const metadata: Metadata = {
    title: '文章分类',
    description: '浏览所有文章分类，找到你感兴趣的内容',
};

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <CategoryList />

            <Footer />
        </div>
    );
}