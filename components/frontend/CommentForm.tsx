// components/frontend/CommentForm.tsx
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor, { RichTextEditorHandle } from './RichTextEditor';
import {
    extractText,
    sanitizeHtml,
    hasImage,
    isContentEmpty,
} from '@/lib/sanitizeHtml';
import { restoreOriginalImageUrls } from '@/lib/imageProxy';
import { cn } from '@/lib/utils';
import SafeImage from './SafeImage';

interface CommentFormProps {
    onSubmit: (data: {
        content: string;
        nickname?: string;
        email?: string;
        parentId?: number;
    }) => Promise<any>;
    isSubmitting: boolean;
    parentId?: number;
    replyTo?: string;
    placeholder?: string;
    compact?: boolean;
    onCancel?: () => void;
}

export default function CommentForm({
    onSubmit,
    isSubmitting,
    parentId,
    replyTo,
    placeholder = '写下你的评论...',
    compact = false,
    onCancel,
}: CommentFormProps) {
    const { user, isLoggedIn } = useAuth();
    const editorRef = useRef<RichTextEditorHandle>(null);

    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

    // ============ 提交处理 ============
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // ✅ 获取编辑器 HTML 内容
        const rawHtml = editorRef.current?.getHtml() || '';

        // ✅ 校验是否为空（纯文本为空且无图片）
        if (isContentEmpty(rawHtml)) {
            setError('请输入评论内容');
            return;
        }

        // ✅ 提取纯文本用于长度校验
        const plainText = extractText(rawHtml);
        if (plainText.length > 5000) {
            setError('评论内容不能超过 5000 字');
            return;
        }

        // ✅ 未登录：检查昵称
        if (!isLoggedIn && !nickname.trim()) {
            setError('请填写昵称');
            return;
        }

        // ✅ 检查编辑器是否正在上传图片
        if (editorRef.current?.isUploading?.()) {
            setError('图片正在上传，请稍候...');
            return;
        }

        setIsSubmittingLocal(true);

        try {
            // ✅ 关键：还原代理 URL 为原始 HTTP URL
            let finalHtml = restoreOriginalImageUrls(rawHtml);

            // ✅ 双保险：优先使用 data-original-src
            finalHtml = finalHtml.replace(
                /<img([^>]*)>/gi,
                (match, attrs) => {
                    // 提取 data-original-src
                    const originalSrcMatch = attrs.match(
                        /data-original-src=["']([^"']+)["']/i
                    );

                    if (originalSrcMatch) {
                        const originalSrc = originalSrcMatch[1];
                        // 替换 src 为原始地址
                        let cleaned = attrs.replace(
                            /src=["'][^"']*["']/i,
                            `src="${originalSrc}"`
                        );
                        // 移除 data-original-src 属性
                        cleaned = cleaned.replace(
                            /\s*data-original-src=["'][^"']*["']/gi,
                            ''
                        );
                        return `<img${cleaned}>`;
                    }

                    return match;
                }
            );

            // ✅ 提交前再次清洗（防止注入）
            const cleanHtml = sanitizeHtml(finalHtml);

            // ✅ 提交
            await onSubmit({
                content: cleanHtml,
                nickname: nickname.trim() || undefined,
                email: email.trim() || undefined,
                parentId,
            });

            // ✅ 清空表单
            editorRef.current?.clear();
            setHtmlContent('');
            if (!isLoggedIn) {
                setEmail('');
                // 保留昵称（用户体验）
            }
            if (onCancel) onCancel();
        } catch (err) {
            console.error('提交评论失败:', err);
            setError(err instanceof Error ? err.message : '评论失败，请稍后重试');
        } finally {
            setIsSubmittingLocal(false);
        }
    };

    // ============ 编辑器内容变化 ============
    const handleEditorChange = (html: string) => {
        setHtmlContent(html);
        // 用户输入时清除错误提示
        if (error) setError('');
    };

    // ============ 状态计算 ============
    const plainText = extractText(htmlContent);
    const isContentValid = !isContentEmpty(htmlContent);
    const isDisabled = isSubmitting || isSubmittingLocal || !isContentValid;

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'space-y-3',
                compact && 'p-3 bg-gray-50 rounded-lg border border-gray-200'
            )}
        >
            {/* ✅ 回复提示 */}
            {replyTo && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
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
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                    </svg>
                    回复 <strong className="text-gray-700">{replyTo}</strong>
                </div>
            )}

            {/* ✅ 未登录：显示昵称 + 邮箱输入框 */}
            {!isLoggedIn && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="昵称（必填）"
                        maxLength={50}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="邮箱（可选，不公开）"
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            )}

            {/* ✅ 已登录：显示用户身份 */}
            {isLoggedIn && user && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                    {/*<img
                        src={user.avatar || '/img/avatar-default.png'}
                        alt={user.nickname || user.username}
                        className="w-5 h-5 rounded-full object-cover"
                    />*/}
                    <SafeImage
                        src={user?.avatar || '/img/avatar-default-member.png'}
                        alt={user?.nickname || user?.username || '用户'}
                        className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>
                        以{' '}
                        <strong className="text-gray-800">
                            {user.nickname || user.username}
                        </strong>{' '}
                        的身份评论
                    </span>
                </div>
            )}

            {/* ✅ 富文本编辑器 */}
            <RichTextEditor
                ref={editorRef}
                placeholder={placeholder}
                minHeight={compact ? 80 : 140}
                maxLength={5000}
                allowImage={true}
                onChange={handleEditorChange}
            />

            {/* ✅ 错误提示 */}
            {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start space-x-1.5">
                    <svg
                        className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* ✅ 操作栏 */}
            <div className="flex items-center justify-between">
                {/* 左侧：字数统计 */}
                <div className="text-xs text-gray-400 flex items-center space-x-2">
                    <span>{plainText.length}/5000</span>
                    {hasImage(htmlContent) && (
                        <span className="text-primary-500 flex items-center space-x-1">
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
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span>含图片</span>
                        </span>
                    )}
                </div>

                {/* 右侧：按钮 */}
                <div className="flex items-center space-x-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmittingLocal}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 
                                rounded-lg transition-colors disabled:opacity-50"
                        >
                            取消
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isDisabled}
                        className={cn(
                            'px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium',
                            'hover:bg-primary-700 transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center space-x-1.5'
                        )}
                    >
                        {isSubmitting || isSubmittingLocal ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                <span>提交中...</span>
                            </>
                        ) : (
                            <span>{parentId ? '回复' : '发表评论'}</span>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}