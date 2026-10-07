// hooks/useBookmark.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/config/env';

type BookmarkTarget = 'article' | 'formula';

interface UseBookmarkOptions {
    target: BookmarkTarget;
    id: number | string | undefined;
    initialMarked?: number;
    enabled?: boolean;
}

interface UseBookmarkResult {
    marked: number;
    isBookmarked: boolean;
    isLoading: boolean;
    toggle: () => Promise<void>;
}

const STORAGE_PREFIX = 'bookmarked_';

function getStorageKey(target: BookmarkTarget, id: number | string): string {
    return `${STORAGE_PREFIX}${target}_${id}`;
}

function checkIsBookmarked(target: BookmarkTarget, id: number | string): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(getStorageKey(target, id)) === '1';
    } catch {
        return false;
    }
}

function markAsBookmarked(target: BookmarkTarget, id: number | string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(getStorageKey(target, id), '1');
    } catch (e) {
        console.warn('保存收藏状态失败:', e);
    }
}

function unmarkAsBookmarked(target: BookmarkTarget, id: number | string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(getStorageKey(target, id));
    } catch (e) {
        console.warn('清除收藏状态失败:', e);
    }
}

export function useBookmark({
    target,
    id,
    initialMarked = 0,
    enabled = true,
}: UseBookmarkOptions): UseBookmarkResult {
    const [marked, setMarked] = useState(initialMarked);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const initialized = useRef(false);

    // 同步初始值
    useEffect(() => {
        setMarked(initialMarked);
    }, [initialMarked]);

    // 初始化：读取本地收藏状态
    useEffect(() => {
        if (!enabled || !id || initialized.current) return;
        initialized.current = true;
        setIsBookmarked(checkIsBookmarked(target, id));
    }, [target, id, enabled]);

    const toggle = useCallback(async () => {
        if (!id || isLoading) return;

        const prevBookmarked = isBookmarked;
        const prevMarked = marked;
        const newBookmarked = !prevBookmarked;

        // ✅ 乐观更新
        setIsBookmarked(newBookmarked);
        setMarked(newBookmarked ? prevMarked + 1 : Math.max(0, prevMarked - 1));
        setIsLoading(true);

        // 立即更新 localStorage
        if (newBookmarked) {
            markAsBookmarked(target, id);
        } else {
            unmarkAsBookmarked(target, id);
        }

        try {
            const endpoint =
                target === 'article'
                    ? `${API_BASE_URL}/articles/${id}/marked`
                    : `${API_BASE_URL}/formulas/${id}/marked`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: newBookmarked ? 'bookmark' : 'unbookmark',
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            if (data.code === 1 && data.data) {
                setMarked(data.data.marked);
            } else {
                throw new Error(data.message || '收藏失败');
            }
        } catch (err) {
            console.error('收藏失败:', err);

            // ❌ 回滚
            setIsBookmarked(prevBookmarked);
            setMarked(prevMarked);

            if (prevBookmarked) {
                markAsBookmarked(target, id);
            } else {
                unmarkAsBookmarked(target, id);
            }
        } finally {
            setIsLoading(false);
        }
    }, [target, id, isBookmarked, marked, isLoading]);

    return {
        marked,
        isBookmarked,
        isLoading,
        toggle,
    };
}