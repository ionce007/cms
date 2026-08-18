// components/frontend/TagCloud.tsx
'use client';

import Link from 'next/link';
import { Tag, FrontendArticle } from '@/types/frontend';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TagCloudProps {
    tags: Tag[];
    articles: FrontendArticle[];
}

export default function TagCloud({ tags, articles }: TagCloudProps) {
    // 计算每个标签的实际文章数
    const tagsWithCount = useMemo(() => {
        return tags.map(tag => {
            const count = articles.filter(article =>
                article.tags.some(t => t.toLowerCase() === tag.name.toLowerCase())
            ).length;
            return { ...tag, actualCount: count || tag.count };
        });
    }, [tags, articles]);

    // 找出最大和最小文章数用于字体大小计算
    const maxCount = Math.max(...tagsWithCount.map(t => t.actualCount));
    const minCount = Math.min(...tagsWithCount.map(t => t.actualCount));

    // 根据文章数计算字体大小
    const getFontSize = (count: number) => {
        if (maxCount === minCount) return 'text-base';
        const ratio = (count - minCount) / (maxCount - minCount);
        if (ratio > 0.8) return 'text-2xl';
        if (ratio > 0.6) return 'text-xl';
        if (ratio > 0.4) return 'text-lg';
        if (ratio > 0.2) return 'text-base';
        return 'text-sm';
    };

    // 根据文章数计算颜色深浅
    const getColorClass = (count: number) => {
        if (maxCount === minCount) return 'bg-primary-50 text-primary-600';
        const ratio = (count - minCount) / (maxCount - minCount);
        if (ratio > 0.7) return 'bg-primary-600 text-white';
        if (ratio > 0.4) return 'bg-primary-100 text-primary-700';
        return 'bg-primary-50 text-primary-600';
    };

    // 热门标签（按文章数排序前10）
    const popularTags = tagsWithCount
        .sort((a, b) => b.actualCount - a.actualCount)
        .slice(0, 10);

    // 所有标签
    const allTags = tagsWithCount.sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-8">
            {/* 热门标签 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">🔥</span>
                    热门标签
                </h2>
                <div className="flex flex-wrap gap-3">
                    {popularTags.map((tag, index) => (
                        <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className={cn(
                                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                                'hover:shadow-md hover:scale-105',
                                index < 3
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                            )}
                        >
                            <span className="flex items-center space-x-2">
                                {index < 3 && <span>{['🥇', '🥈', '🥉'][index]}</span>}
                                <span>#{tag.name}</span>
                                <span className={cn(
                                    'text-xs px-1.5 py-0.5 rounded-full',
                                    index < 3 ? 'bg-white/20' : 'bg-gray-200'
                                )}>
                                    {tag.actualCount}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 所有标签云 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-2">🏷️</span>
                    所有标签
                </h2>
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                        <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className={cn(
                                'px-3 py-1.5 rounded-lg transition-all duration-200',
                                'hover:shadow-md hover:scale-105',
                                getFontSize(tag.actualCount),
                                getColorClass(tag.actualCount)
                            )}
                            title={`${tag.actualCount} 篇文章`}
                        >
                            #{tag.name}
                            <span className="ml-1 text-xs opacity-70">({tag.actualCount})</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}