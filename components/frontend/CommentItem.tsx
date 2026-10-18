// components/frontend/CommentItem.tsx
'use client';

import { useState, useMemo } from 'react';
import CommentForm from './CommentForm';
import { useAuth } from '@/contexts/AuthContext';
import { CommentItem as CommentItemType } from '@/hooks/useComments';
import {
    sanitizeHtml,
    isPlainText,
    plainTextToHtml,
} from '@/lib/sanitizeHtml';
import { proxyHtmlImageUrls } from '@/lib/imageProxy';
import { cn } from '@/lib/utils';
// ✅ 引入 useLightbox
import { useLightbox } from '@/components/frontend/ImageLightbox';

interface CommentItemProps {
    comment: CommentItemType;
    onSubmitReply: (data: {
        content: string;
        nickname?: string;
        email?: string;
        parentId?: number;
    }) => Promise<any>;
    onDelete?: (id: number) => Promise<void>;
    isSubmitting: boolean;
    level?: number;
}

export default function CommentItem({
    comment,
    onSubmitReply,
    onDelete,
    isSubmitting,
    level = 1,
}: CommentItemProps) {
    const { user } = useAuth();
    // ✅ 获取灯箱方法
    const { openLightbox } = useLightbox();
    
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);

    // ✅ 判断是否是当前用户自己的评论
    const isOwn = user && comment.memberId === user.id;

    // ✅ 渲染时：将 HTTP 图片转为代理 URL + XSS 清洗
    const safeHtml = useMemo(() => {
        let html = comment.content;

        // 兼容旧数据：纯文本 → HTML
        if (isPlainText(html)) {
            html = plainTextToHtml(html);
        }

        // ✅ 关键：将 HTTP 图片 URL 转为代理 URL（HTTPS 页面才能显示）
        html = proxyHtmlImageUrls(html);

        // ✅ XSS 清洗（保留 img、table 等富文本标签）
        return sanitizeHtml(html);
    }, [comment.content]);

    // ✅ 处理评论内容中的图片点击放大
    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        // 判断点击的是不是图片
        if (target.tagName === 'IMG') {
            const img = target as HTMLImageElement;
            // 优先取 data-original-src（如果有），否则取 src
            const src = img.getAttribute('data-original-src') || img.src;
            if (src) {
                e.preventDefault();
                e.stopPropagation();
                openLightbox([src]); // 打开灯箱
            }
        }
    };

    // ✅ 格式化时间
    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes} 分钟前`;
        if (hours < 24) return `${hours} 小时前`;
        if (days < 7) return `${days} 天前`;
        return d.toLocaleDateString('zh-CN');
    };

    // ✅ 控制回复显示数量
    const replies = comment.replies || [];
    const visibleReplies = showAllReplies ? replies : replies.slice(0, 2);
    const hasMoreReplies = replies.length > 2;

    return (
        <div
            className={cn(
                'relative',
                level > 1 && 'ml-4 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-gray-100'
            )}
        >
            <div className="py-4">
                {/* 头部：头像 + 昵称 + 时间 */}
                <div className="flex items-start space-x-3">
                    <img
                        src={comment.avatar || '/img/avatar-default.png'}
                        alt={comment.nickname}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-1">
                            <span className="text-sm font-medium text-gray-800">
                                {comment.nickname}
                            </span>

                            {/* 匿名标识 */}
                            {comment.isAnonymous && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">
                                    匿名
                                </span>
                            )}

                            {/* 回复标识 */}
                            {comment.replyTo && (
                                <span className="text-xs text-gray-500">
                                    回复{' '}
                                    <span className="text-primary-600">
                                        @{comment.replyTo}
                                    </span>
                                </span>
                            )}

                            <span className="text-xs text-gray-400">
                                · {formatTime(comment.createdAt)}
                            </span>
                        </div>

                        {/* ✅ 富文本内容：绑定点击事件，支持图片放大 */}
                        <div
                            className="comment-content text-sm text-gray-700 mb-2"
                            onClick={handleContentClick}
                            dangerouslySetInnerHTML={{ __html: safeHtml }}
                        />

                        {/* 操作栏 */}
                        <div className="flex items-center space-x-3 text-xs">
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
                            >
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
                                        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                    />
                                </svg>
                                <span>回复</span>
                            </button>

                            {isOwn && onDelete && (
                                <button
                                    onClick={() => {
                                        if (confirm('确定删除这条评论？删除后无法恢复。')) {
                                            onDelete(comment.id);
                                        }
                                    }}
                                    className="text-gray-500 hover:text-red-600 transition-colors flex items-center space-x-1"
                                >
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
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    <span>删除</span>
                                </button>
                            )}
                        </div>

                        {/* 回复表单 */}
                        {showReplyForm && (
                            <div className="mt-3">
                                <CommentForm
                                    onSubmit={onSubmitReply}
                                    isSubmitting={isSubmitting}
                                    parentId={comment.id}
                                    replyTo={comment.nickname}
                                    placeholder={`回复 @${comment.nickname}...`}
                                    compact
                                    onCancel={() => setShowReplyForm(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ 递归渲染子评论 */}
                {replies.length > 0 && (
                    <div className="mt-2">
                        {visibleReplies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onSubmitReply={onSubmitReply}
                                onDelete={onDelete}
                                isSubmitting={isSubmitting}
                                level={level + 1}
                            />
                        ))}

                        {/* 展开更多回复 */}
                        {hasMoreReplies && !showAllReplies && (
                            <button
                                onClick={() => setShowAllReplies(true)}
                                className="ml-4 sm:ml-8 mt-2 text-xs text-primary-600 
                                    hover:text-primary-700 transition-colors 
                                    flex items-center space-x-1"
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
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                                <span>展开 {replies.length - 2} 条回复</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}