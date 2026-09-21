// components/frontend/ArticleFilters.tsx
'use client';

import { useState } from 'react';
import { ArticleFilters as FilterType, Category1, Tag } from '@/types/frontend';
import { cn } from '@/lib/utils';

interface ArticleFiltersProps {
    filters: FilterType;
    categories: Category1[];
    tags: Tag[];
    onFilterChange: (filters: FilterType) => void;
}

export default function ArticleFilters({ filters, categories, tags, onFilterChange }: ArticleFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);  // 默认折叠

    const sortOptions = [
        { value: 'latest', label: '最新发布' },
        { value: 'popular', label: '最热门' },
        { value: 'oldest', label: '最早发布' },
        { value: 'liked', label: '最多点赞' },
    ];

    const updateFilter = (key: keyof FilterType, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFilterChange({
            category: '',
            tag: '',
            sort: 'latest',
            search: '',
            page: 1,
            limit: filters.limit,
        });
    };

    const hasActiveFilters = filters.category || filters.tag || filters.search;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-2 lg:p-3">
            {/* 折叠/展开按钮 */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-gray-700 font-medium"
            >
                <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>筛选条件</span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full">
                            已筛选
                        </span>
                    )}
                </span>
                <svg
                    className={cn('w-5 h-5 transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* 过滤条件内容 - 默认隐藏 */}
            {isExpanded && (
                <div className="space-y-6 mt-4 animate-fade-in">
                    {/* 搜索框 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="搜索文章..."
                                value={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* 排序 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
                        <div className="flex flex-wrap gap-2">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateFilter('sort', option.value)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                        filters.sort === option.value
                                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 分类筛选 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">文章分类</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => updateFilter('category', '')}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                    !filters.category
                                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                )}
                            >
                                全部
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => updateFilter('category', category.id.toString())}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                        filters.category === category.id.toString()
                                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                    )}
                                >
                                    {category.icon} {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 标签筛选 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">热门标签</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => updateFilter('tag', '')}
                                className={cn(
                                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                                    !filters.tag
                                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                )}
                            >
                                全部
                            </button>
                            {tags.slice(0, 10).map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => updateFilter('tag', tag.id.toString())}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                                        filters.tag === tag.id.toString()
                                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                                    )}
                                >
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 清除筛选 */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            清除所有筛选
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}