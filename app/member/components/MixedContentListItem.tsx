// app/member/components/MixedContentListItem.tsx
'use client';

import Link from 'next/link';
import CoverImage from '@/components/frontend/CoverImage';
import { cn } from '@/lib/utils';

// ============ 类型定义 ============

export interface ArticleInfo {
    id: number;
    title: string;
    img: string;
    description: string;
    pv: number;
    likes?: number | null;
    marked?: number;
}

export interface FormulaInfo {
    fs_id: string;
    server_filename: string;
    img: string;
    summary: string;
    size: number;
    price: number;
    views: number;
    likes: number;
    marked: number;
}

export interface MixedContentRecord {
    id: number;
    targetType: 'article' | 'formula';
    targetId: string;
    content?: string;
    createdAt: string;

    /** ✅ 最后下载时间（仅 downloads 场景有） */
    lastDownloadAt?: string;

    /** ✅ 下载次数（仅 downloads 场景有） */
    downloadCount?: number;

    article: ArticleInfo | null;
    formula: FormulaInfo | null;
}

// ============ 工具函数 ============

function formatFileSize(bytes: number): string {
    if (!bytes || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let size = Number(bytes);
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

// ============ 组件 ============

interface MixedContentListItemProps {
    record: MixedContentRecord;
    /** 操作按钮文案 */
    actionLabel?: string;
    /** ✅ 是否显示下载统计（下载次数 + 最后下载时间） */
    showDownloadStats?: boolean;
}

export default function MixedContentListItem({
    record,
    actionLabel,
    showDownloadStats = false,
}: MixedContentListItemProps) {
    const isFormula = record.targetType === 'formula';
    const data = isFormula ? record.formula : record.article;

    // 数据已被删除
    if (!data) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-4 
                      flex items-center gap-4 opacity-60">
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center 
                        justify-center flex-shrink-0">
                    <span className="text-2xl text-gray-300">🗑️</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-400 italic">内容已删除</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {formatDate(record.createdAt)}
                    </div>
                </div>
            </div>
        );
    }

    const title = isFormula
        ? (record.formula?.server_filename || '公式')
        : (record.article?.title || '文章');

    const cover = isFormula
        ? (record.formula?.img || '')
        : (record.article?.img || '');

    const targetUrl = isFormula
        ? `/downloads/${record.formula?.fs_id || record.targetId}`
        : `/articles/${record.article?.id || record.targetId}`;

    const summary = isFormula
        ? (record.formula?.summary || '')
        : (record.article?.description || '');

    // 元信息
    const metaItems: string[] = [];
    if (isFormula) {
        if (record.formula?.size) {
            metaItems.push(formatFileSize(record.formula.size));
        }
        metaItems.push(
            record.formula?.price && record.formula.price > 0
                ? `¥${record.formula.price}`
                : '免费'
        );
        if (record.formula?.views !== undefined) {
            metaItems.push(`${record.formula.views} 浏览`);
        }
    } else {
        if (record.article?.pv !== undefined) {
            metaItems.push(`${record.article.pv} 阅读`);
        }
    }

    // ✅ 时间显示：优先用 lastDownloadAt（下载场景），否则用 createdAt
    const displayTime = showDownloadStats && record.lastDownloadAt
        ? record.lastDownloadAt
        : record.createdAt;

    return (
        <Link
            href={targetUrl}
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-md hover:border-primary-200 transition-all',
                'flex flex-col sm:flex-row group'
            )}
        >
            {/* ============ 左侧封面 ============ */}
            <div className="sm:w-40 lg:w-48 flex-shrink-0 relative">
                <div className="aspect-video sm:aspect-auto sm:h-full min-h-[120px]">
                    <CoverImage
                        src={cover}
                        alt={title}
                        aspectRatio="fill"
                        objectFit="cover"
                        useBlurBackground={false}
                        fallbackIcon={isFormula ? '⬇' : '📄'}
                        className="w-full h-full"
                    />
                </div>

                {/* 类型标签 */}
                <div className="absolute top-2 left-2">
                    <span
                        className={cn(
                            'inline-flex items-center px-2 py-0.5 text-xs rounded-full',
                            'font-medium shadow-sm backdrop-blur-sm',
                            isFormula
                                ? 'bg-primary-600/90 text-white'
                                : 'bg-white/90 text-gray-700'
                        )}
                    >
                        {isFormula ? '公式' : '文章'}
                    </span>
                </div>

                {/* ✅ 下载次数角标（下载场景） */}
                {showDownloadStats && record.downloadCount && record.downloadCount > 0 && (
                    <div className="absolute top-2 right-2">
                        <span
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs 
                         rounded-full bg-black/60 text-white font-medium 
                         shadow-sm backdrop-blur-sm"
                        >
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            <span>{record.downloadCount}</span>
                        </span>
                    </div>
                )}

                {/* 公式价格标签（非下载场景才显示，避免角标冲突） */}
                {!showDownloadStats &&
                    isFormula &&
                    record.formula?.price !== undefined &&
                    record.formula.price > 0 && (
                        <div className="absolute top-2 right-2">
                            <span
                                className="inline-flex items-center px-2 py-0.5 text-xs 
                           rounded-full bg-red-500/90 text-white font-medium 
                           shadow-sm"
                            >
                                ¥{record.formula.price}
                            </span>
                        </div>
                    )}
            </div>

            {/* ============ 右侧内容 ============ */}
            <div className="flex-1 p-4 flex flex-col min-w-0">
                <h3
                    className="text-base font-semibold text-gray-800 
                     group-hover:text-primary-600 transition-colors 
                     line-clamp-2 mb-2"
                >
                    {title}
                </h3>

                {summary && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                        {summary}
                    </p>
                )}

                {/* 底部元信息 */}
                <div className="flex items-center justify-between gap-2 pt-3 
                        border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                        {metaItems.map((item, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                                {idx > 0 && <span className="text-gray-300">·</span>}
                                <span>{item}</span>
                            </span>
                        ))}
                        {metaItems.length > 0 && (
                            <span className="text-gray-300">·</span>
                        )}
                        <span>
                            {/* ✅ 下载场景加前缀，更清晰 */}
                            {showDownloadStats && '最后下载于 '}
                            {formatDate(displayTime)}
                        </span>
                    </div>

                    <span
                        className="flex-shrink-0 text-xs text-primary-600 
                       group-hover:text-primary-700 transition-colors 
                       flex items-center gap-0.5"
                    >
                        {actionLabel || (isFormula ? '查看详情' : '阅读全文')}
                        <svg
                            className="w-3.5 h-3.5 group-hover:translate-x-0.5 
                         transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}