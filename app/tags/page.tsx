// app/tags/page.tsx
import { Metadata } from 'next';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import TagCloud from '@/components/frontend/TagCloud';
import Sidebar from '@/components/frontend/Sidebar';
import { tags } from '@/data/articlesData';
import { allArticles } from '@/data/articlesData';

export const metadata: Metadata = {
    title: '热门标签',
    description: '浏览所有热门标签，快速找到你感兴趣的内容',
};

export default function TagsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            热门标签
                        </h1>
                        <p className="text-gray-600">
                            共 {tags.length} 个标签，点击标签查看相关文章
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* 标签云 */}
                        <div className="flex-1">
                            <TagCloud tags={tags} articles={allArticles} />
                        </div>

                        {/* 右侧边栏 */}
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