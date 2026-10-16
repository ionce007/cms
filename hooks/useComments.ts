// hooks/useComments.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/env';
import { useAuth } from '@/contexts/AuthContext';

// ✅ 评论类型定义
export interface CommentItem {
    id: number;
    targetType: 'article' | 'formula';
    targetId: string;
    memberId: number | null;
    nickname: string;
    avatar?: string;
    email?: string;
    content: string;
    parentId: number | null;
    path: string;
    level: number;
    replyCount: number;
    likes: number;
    status: number;
    replyTo?: string | null;
    createdAt: string;
    isAnonymous?: boolean;
    replies?: CommentItem[];
}

interface UseCommentsParams {
    targetType: 'article' | 'formula';
    targetId: string;
}

export function useComments({ targetType, targetId }: UseCommentsParams) {
    const { token } = useAuth();
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);   // ✅ 新增
    const [error, setError] = useState<string | null>(null);

    // ✅ 拉取评论
    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${API_BASE_URL}/comments?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}`
            );
            const data = await res.json();
            if (data.code === 1) {
                setComments(data.data || []);
            } else {
                setError(data.message || '加载失败');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '网络错误');
        } finally {
            setLoading(false);
        }
    }, [targetType, targetId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // ✅ 发表评论（顶级或回复）
    const addComment = useCallback(
        async (content: string, parentId?: number) => {
            setSubmitting(true);
            try {
                const res = await fetch(`${API_BASE_URL}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        targetType,
                        targetId,
                        content,
                        parentId,
                    }),
                });
                const data = await res.json();
                if (data.code !== 1) {
                    throw new Error(data.message || '发表失败');
                }
                await refresh();   // ✅ 刷新列表
            } finally {
                setSubmitting(false);
            }
        },
        [targetType, targetId, token, refresh]
    );

    // ✅ 删除评论
    const deleteComment = useCallback(
        async (id: number) => {
            const res = await fetch(`${API_BASE_URL}/comments/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.code !== 1) {
                throw new Error(data.message || '删除失败');
            }
            await refresh();   // ✅ 刷新列表
        },
        [token, refresh]
    );

    return {
        comments,
        loading,
        submitting,      // ✅ 提供给 CommentSection
        error,
        refresh,
        addComment,      // ✅
        deleteComment,   // ✅
    };
}