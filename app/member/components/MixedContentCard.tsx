// app/member/components/MixedContentCard.tsx
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface MixedContentItem {
    id: number;
    targetType: 'article' | 'formula';
    targetId: string,
    title: string;
    excerpt?: string;
    coverImage?: string;
    views?: number;
    readTime?: number;
    fileSize?: string;
    publishDate?: string;
    url: string;
}

interface MixedContentCardProps {
    item: MixedContentItem;
}

export default function MixedContentCard({ item }: MixedContentCardProps) {
    const isFormula = item.targetType === 'formula';
    const url = isFormula ? `/downloads/${item.targetId}` : `/articles/${item.targetId}`
    return (
        <Link
            href={url}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden 
                 hover:shadow-lg hover:border-primary-200 transition-all 
                 duration-300 group flex flex-col"
        >
            {/* 封面图 */}
            <div className="relative aspect-video overflow-hidden bg-gray-100">
                {item.coverImage ? (
                    <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 
                       transition-transform duration-500"
                        onError={e => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div
                        className={cn(
                            'w-full h-full flex items-center justify-center',
                            isFormula
                                ? 'bg-gradient-to-br from-primary-500 to-primary-700'
                                : 'bg-gradient-to-br from-gray-200 to-gray-300'
                        )}
                    >
                        <span className="text-4xl">{isFormula ? '⬇' : '📄'}</span>
                    </div>
                )}

                {/* ✅ 类型标签 */}
                <div className="absolute top-3 left-3">
                    <span
                        className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full shadow-sm backdrop-blur-sm',
                            isFormula
                                ? 'bg-primary-600/90 text-white'
                                : 'bg-white/90 text-gray-700'
                        )}
                    >
                        {isFormula ? '下载' : '文章'}
                    </span>
                </div>
            </div>

            {/* 内容 */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-gray-800 
                       group-hover:text-primary-600 transition-colors 
                       line-clamp-2 mb-2">
                    {item.title}
                </h3>

                {item.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                        {item.excerpt}
                    </p>
                )}

                {/* 元信息 */}
                <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 
                        border-t border-gray-100">
                    {isFormula ? (
                        <>
                            {item.fileSize && <span>{item.fileSize}</span>}
                            {item.publishDate && <span>{item.publishDate}</span>}
                        </>
                    ) : (
                        <>
                            <span>{item.readTime || 0} 分钟</span>
                            <span>·</span>
                            <span>{(item.views || 0).toLocaleString()} 阅读</span>
                            {item.publishDate && (
                                <>
                                    <span>·</span>
                                    <span>{item.publishDate}</span>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}