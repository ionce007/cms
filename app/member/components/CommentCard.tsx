// app/member/components/CommentCard.tsx
'use client';

import Link from 'next/link';
import CoverImage from '@/components/frontend/CoverImage'
import { sanitizeCommentHtml } from '@/lib/sanitize';
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

export interface MemberComment {
    id: number;
    targetType: 'article' | 'formula';
    targetId: string;
    createdAt: string;

    /** 文章信息（targetType = 'article' 时有值） */
    article: ArticleInfo | null;

    /** 公式信息（targetType = 'formula' 时有值） */
    formula: FormulaInfo | null;

    /** 评论内容 HTML */
    content?: string;

    /** 评论自身被点赞数 */
    likes?: number;

    /** 审核状态 */
    status?: number;
}

interface CommentCardProps {
    comment: MemberComment;
    onDelete?: (id: number) => void;
}

// ============ 工具函数 ============

/**
 * 格式化文件大小（字节 → 人类可读）
 */
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

/**
 * 格式化时间
 */
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

export default function CommentCard({ comment, onDelete }: CommentCardProps) {
    const isFormula = comment.targetType === 'formula';

    // ✅ 根据类型提取展示信息
    const targetTitle = isFormula
        ? comment.formula?.server_filename || '公式已删除'
        : comment.article?.title || '文章已删除';

    // ✅ 封面：取原始 URL（CoverImage 内部会走代理）
    const targetCover = isFormula
        ? comment.formula?.img || ''
        : comment.article?.img || '';

    // ✅ 跳转 URL
    const targetUrl = isFormula
        ? `/downloads/${comment.formula?.fs_id || comment.targetId}`
        : `/articles/${comment.article?.id || comment.targetId}`;

    // ✅ 副信息
    const metaLine = isFormula
        ? [
            comment.formula?.size ? formatFileSize(comment.formula.size) : '',
            comment.formula?.price ? `¥${comment.formula.price}` : '免费',
            comment.formula?.views ? `${comment.formula.views} 浏览` : '',
        ]
            .filter(Boolean)
            .join(' · ')
        : comment.article?.pv !== undefined
            ? `${comment.article.pv} 阅读`
            : '';

    // ✅ 评论内容：净化 + 图片代理（在 sanitizeCommentHtml 内完成）
    const safeContent = comment.content
        ? sanitizeCommentHtml(comment.content)
        : '';

    return (
        <div
            className="bg-white rounded-xl border border-gray-200 p-5 
                 hover:shadow-md hover:border-primary-200 transition-all"
        >
            {/* ==================== 关联目标 ==================== */}
            <Link
                href={targetUrl}
                className="flex items-center gap-3 mb-4 group"
            >
                {/* ✅ 封面 - 使用 CoverImage 组件，自动走代理 */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    {/*<CoverImage
                        src={targetCover}
                        alt={targetTitle}
                        className="w-full h-full"
                        objectFit="cover"
                        fallbackIcon={isFormula ? '∑' : '📄'}
                        useProxy={true}
                    />*/}
                    <CoverImage
                        src={targetCover}
                        alt={targetTitle}
                        aspectRatio="fill"
                        objectFit="cover"
                        useBlurBackground={false}
                        fallbackIcon={isFormula ? '⬇' : '📄'}
                        className="w-full h-full"
                    />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-gray-400">评论于</span>
                        <span
                            className={cn(
                                'inline-flex items-center px-1.5 py-0.5 text-[10px] rounded font-medium',
                                isFormula
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'bg-blue-50 text-blue-600'
                            )}
                        >
                            {isFormula ? '公式' : '文章'}
                        </span>
                    </div>

                    <h3
                        className="text-sm font-medium text-gray-700 
                       group-hover:text-primary-600 transition-colors 
                       line-clamp-2"
                        title={targetTitle}
                    >
                        {targetTitle}
                    </h3>

                    {metaLine && (
                        <div className="text-xs text-gray-400 mt-0.5">{metaLine}</div>
                    )}
                </div>

                {/* 箭头 */}
                <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-primary-500 
                     group-hover:translate-x-0.5 transition-all flex-shrink-0"
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
            </Link>

            {/* ==================== 评论内容（渲染 HTML，图片已走代理） ==================== */}
            <div className="mb-4">
                {safeContent ? (
                    <div
                        className="comment-content prose prose-sm max-w-none text-gray-700 
                       leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: safeContent }}
                    />
                ) : (
                    <p className="text-sm text-gray-400 italic">（评论内容未返回）</p>
                )}
            </div>

            {/* ==================== 底部操作栏 ==================== */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {/* 时间 + 点赞 */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{formatDate(comment.createdAt)}</span>

                    {comment.likes !== undefined && (
                        <span className="flex items-center gap-1">
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            {comment.likes}
                        </span>
                    )}
                </div>

                {/* 操作 */}
                <div className="flex items-center gap-2">
                    <Link
                        href={targetUrl}
                        className="px-3 py-1.5 text-xs text-primary-600 
                       hover:bg-primary-50 rounded-lg transition-colors"
                    >
                        查看原文
                    </Link>

                    {/*{onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(comment.id)}
                            className="px-3 py-1.5 text-xs text-red-600 
                         hover:bg-red-50 rounded-lg transition-colors"
                        >
                            删除
                        </button>
                    )}*/}
                </div>
            </div>
        </div>
    );
}