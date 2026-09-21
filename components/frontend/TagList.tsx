// components/frontend/CategoryCard.tsx
'use client';

import Link from 'next/link';
import { Tag } from '@/types/frontend';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar'
import TagCloud from './TagCloud'
//import CategoryCard from './CategoryCard'
import { useTags, useArticles } from '@/hooks/useCommonData'
interface TagCardProps {
    tag: Tag;
    articleCount: number;
    index?: number;
}

export default function TagList() {
    const res = useTags();
    const tags = res.data || [];

    return (
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
                        <TagCloud tags={tags} />
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