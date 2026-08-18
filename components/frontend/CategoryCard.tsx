// components/frontend/CategoryCard.tsx
'use client';

import Link from 'next/link';
import { Category } from '@/types/frontend';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
    category: Category;
    articleCount: number;
    index?: number;
}

export default function CategoryCard({ category, articleCount, index = 0 }: CategoryCardProps) {
    // 不同分类使用不同的渐变色
    const gradientClasses = [
        'from-blue-500 to-blue-600',
        'from-green-500 to-green-600',
        'from-purple-500 to-purple-600',
        'from-orange-500 to-orange-600',
        'from-pink-500 to-pink-600',
        'from-teal-500 to-teal-600',
        'from-indigo-500 to-indigo-600',
        'from-red-500 to-red-600',
    ];

    const gradient = gradientClasses[index % gradientClasses.length];

    return (
        <Link
            href={`/categories/${category.slug}`}
            className={cn(
                'bg-white rounded-xl border border-gray-200 p-6',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300',
                'group cursor-pointer animate-slide-up'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    'text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300',
                    gradient
                )}>
                    <span>{category.icon}</span>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {articleCount} 篇
                </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors mb-1">
                {category.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
                浏览 {category.name} 相关的所有文章
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    点击查看全部
                </span>
                <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}