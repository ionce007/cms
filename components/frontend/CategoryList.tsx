// components/frontend/CategoryCard.tsx
'use client';

import Link from 'next/link';
import { Category1 } from '@/types/frontend';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar'
import CategoryCard from './CategoryCard'
import { useCategories } from '@/hooks/useCommonData'
interface CategoryCardProps {
    category: Category1;
    articleCount: number;
    index?: number;
}

export default function CategoryList() {
    const res = useCategories();
    const categories = res.data || [];

    return (
        <main className="flex-1">
            {/* 页面标题 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        文章分类
                    </h1>
                    <p className="text-gray-600">
                        共 {categories.length} 个分类，浏览你感兴趣的主题
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 分类卡片网格 */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((category, index) => {
                                // 计算每个分类的实际文章数
                                const articleCount = category.count;
                                return (
                                    <CategoryCard
                                        key={category.id}
                                        category={category}
                                        articleCount={category.count}
                                        index={index}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* 右侧边栏 */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </main>
    );
}