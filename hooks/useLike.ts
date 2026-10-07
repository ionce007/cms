// hooks/useLike.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/config/env';

type LikeTarget = 'article' | 'formula';

interface UseLikeOptions {
    /** 目标类型 */
    target: LikeTarget;
    /** 目标 ID */
    id: number | string | undefined;
    /** 初始点赞数 */
    initialLikes?: number;
    /** 是否启用 */
    enabled?: boolean;
}

interface UseLikeResult {
    /** 当前点赞数 */
    likes: number;
    /** 当前用户是否已点赞 */
    isLiked: boolean;
    /** 是否正在请求 */
    isLoading: boolean;
    /** 切换点赞状态 */
    toggle: () => Promise<void>;
}

// ✅ localStorage key 前缀
const STORAGE_PREFIX = 'liked_';

/**
 * 生成 localStorage key
 */
function getStorageKey(target: LikeTarget, id: number | string): string {
    return `${STORAGE_PREFIX}${target}_${id}`;
}

/**
 * 检查是否已点赞
 */
function checkIsLiked(target: LikeTarget, id: number | string): boolean {
    if (typeof window === 'undefined') return false;

    try {
        return localStorage.getItem(getStorageKey(target, id)) === '1';
    } catch {
        return false;
    }
}

/**
 * 标记已点赞
 */
function markAsLiked(target: LikeTarget, id: number | string): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(getStorageKey(target, id), '1');
    } catch (e) {
        console.warn('保存点赞状态失败:', e);
    }
}

/**
 * 取消点赞标记
 */
function unmarkAsLiked(target: LikeTarget, id: number | string): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(getStorageKey(target, id));
    } catch (e) {
        console.warn('清除点赞状态失败:', e);
    }
}

/**
 * 通用点赞 Hook
 */
export function useLike({
    target,
    id,
    initialLikes = 0,
    enabled = true,
}: UseLikeOptions): UseLikeResult {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const initialized = useRef(false);

    // ✅ 同步初始点赞数
    useEffect(() => {
        setLikes(initialLikes);
    }, [initialLikes]);

    // ✅ 初始化：从 localStorage 读取点赞状态
    useEffect(() => {
        if (!enabled || !id || initialized.current) return;

        initialized.current = true;
        const liked = checkIsLiked(target, id);
        setIsLiked(liked);
    }, [target, id, enabled]);

    // ✅ 切换点赞
    const toggle = useCallback(async () => {
        if (!id || isLoading) return;

        const prevLiked = isLiked;
        const prevLikes = likes;
        const newLiked = !prevLiked;

        // ✅ 乐观更新
        setIsLiked(newLiked);
        setLikes(newLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1));
        setIsLoading(true);

        // ✅ 立即更新 localStorage
        if (newLiked) {
            markAsLiked(target, id);
        } else {
            unmarkAsLiked(target, id);
        }

        try {
            // ✅ 拼接 API 路径
            const endpoint =
                target === 'article'
                    ? `${API_BASE_URL}/articles/${id}/like`
                    : `${API_BASE_URL}/formulas/${id}/like`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: newLiked ? 'like' : 'unlike',
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            if (data.code === 1 && data.data) {
                // ✅ 用服务端返回的准确值同步
                setLikes(data.data.likes);
            } else {
                throw new Error(data.message || '点赞失败');
            }
        } catch (err) {
            console.error('点赞失败:', err);

            // ❌ 回滚
            setIsLiked(prevLiked);
            setLikes(prevLikes);

            // 回滚 localStorage
            if (prevLiked) {
                markAsLiked(target, id);
            } else {
                unmarkAsLiked(target, id);
            }

            // 可选：提示用户
            // alert('点赞失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    }, [target, id, isLiked, likes, isLoading]);

    return {
        likes,
        isLiked,
        isLoading,
        toggle,
    };
}