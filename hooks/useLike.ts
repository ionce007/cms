// hooks/useLike.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/config/env';
import { useAuth } from '@/contexts/AuthContext';

type LikeTarget = 'article' | 'formula';

interface UseLikeOptions {
    target: LikeTarget;
    id: number | string | undefined;
    initialLikes?: number;
    /** 初始是否已点赞（从服务端返回） */
    initialIsLiked?: boolean;
    enabled?: boolean;
}

interface UseLikeResult {
    likes: number;
    isLiked: boolean;
    isLoading: boolean;
    toggle: () => Promise<void>;
    /** ✅ 需要登录 */
    needLogin: boolean;
    /** ✅ 关闭登录提示 */
    closeLoginModal: () => void;
}

export function useLike({
    target,
    id,
    initialLikes = 0,
    initialIsLiked = false,
    enabled = true,
}: UseLikeOptions): UseLikeResult {
    const { isLoggedIn, token } = useAuth();

    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);
    const [needLogin, setNeedLogin] = useState(false);

    const initialized = useRef(false);

    // 同步初始值
    useEffect(() => {
        setLikes(initialLikes);
    }, [initialLikes]);

    useEffect(() => {
        if (initialIsLiked !== undefined) {
            setIsLiked(initialIsLiked);
        }
    }, [initialIsLiked]);

    const toggle = useCallback(async () => {
        if (!id || isLoading) return;

        // ✅ 未登录：弹窗提示
        if (!isLoggedIn || !token) {
            setNeedLogin(true);
            return;
        }

        const prevLiked = isLiked;
        const prevLikes = likes;
        const newLiked = !prevLiked;

        // 乐观更新
        setIsLiked(newLiked);
        setLikes(newLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1));
        setIsLoading(true);

        try {
            const endpoint =
                target === 'article'
                    ? `${API_BASE_URL}/articles/${id}/like`
                    : `${API_BASE_URL}/formulas/${id}/like`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,  // ✅ 带上 token
                },
                body: JSON.stringify({
                    action: newLiked ? 'like' : 'unlike',
                }),
            });

            if (res.status === 401) {
                // Token 失效
                setNeedLogin(true);
                setIsLiked(prevLiked);
                setLikes(prevLikes);
                return;
            }

            const data = await res.json();
            if (data.code === 1 && data.data) {
                setLikes(data.data.likes);
            } else if(data.code === 2){
                alert(data.message);
            } else {
                throw new Error(data.message || '操作失败');
            }
        } catch (err) {
            console.error('点赞失败:', err);
            // 回滚
            setIsLiked(prevLiked);
            setLikes(prevLikes);
        } finally {
            setIsLoading(false);
        }
    }, [target, id, isLiked, likes, isLoading, isLoggedIn, token]);

    return {
        likes,
        isLiked,
        isLoading,
        toggle,
        needLogin,
        closeLoginModal: () => setNeedLogin(false),
    };
}