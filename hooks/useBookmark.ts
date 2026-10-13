// hooks/useBookmark.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/config/env';
import { useAuth } from '@/contexts/AuthContext';

type BookmarkTarget = 'article' | 'formula';

interface UseBookmarkOptions {
    /** 目标类型 */
    target: BookmarkTarget;
    /** 目标 ID */
    id: number | string | undefined;
    /** 初始收藏数 */
    initialMarked?: number;
    /** 初始是否已收藏（服务端返回，仅登录用户有效） */
    initialIsBookmarked?: boolean;
    /** 是否启用 */
    enabled?: boolean;
}

interface UseBookmarkResult {
    /** 当前收藏数 */
    marked: number;
    /** 当前用户是否已收藏 */
    isBookmarked: boolean;
    /** 是否正在请求 */
    isLoading: boolean;
    /** 切换收藏状态 */
    toggle: () => Promise<void>;
    /** 是否需要登录（用于触发登录弹窗） */
    needLogin: boolean;
    /** 关闭登录提示 */
    closeLoginModal: () => void;
}

// ✅ localStorage key 前缀（用于未登录时的本地记录）
const STORAGE_PREFIX = 'bookmarked_';

/**
 * 生成 localStorage key
 */
function getStorageKey(target: BookmarkTarget, id: number | string): string {
    return `${STORAGE_PREFIX}${target}_${id}`;
}

/**
 * 检查本地是否已收藏
 */
function checkLocalBookmarked(target: BookmarkTarget, id: number | string): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(getStorageKey(target, id)) === '1';
    } catch {
        return false;
    }
}

/**
 * 标记本地为已收藏
 */
function markLocalBookmarked(target: BookmarkTarget, id: number | string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(getStorageKey(target, id), '1');
    } catch (e) {
        console.warn('保存收藏状态失败:', e);
    }
}

/**
 * 清除本地收藏标记
 */
function unmarkLocalBookmarked(target: BookmarkTarget, id: number | string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(getStorageKey(target, id));
    } catch (e) {
        console.warn('清除收藏状态失败:', e);
    }
}

/**
 * 通用收藏 Hook
 * 
 * 功能：
 * - 收藏/取消收藏
 * - 乐观更新
 * - 失败回滚
 * - 未登录时触发登录提示
 * - 登录用户使用服务端数据
 * - 未登录用户使用 localStorage
 */
export function useBookmark({
    target,
    id,
    initialMarked = 0,
    initialIsBookmarked = false,
    enabled = true,
}: UseBookmarkOptions): UseBookmarkResult {
    const { isLoggedIn, token } = useAuth();

    // ✅ 状态
    const [marked, setMarked] = useState(initialMarked);
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [isLoading, setIsLoading] = useState(false);
    const [needLogin, setNeedLogin] = useState(false);

    const initialized = useRef(false);

    // ==================== 同步初始值 ====================
    useEffect(() => {
        setMarked(initialMarked);
    }, [initialMarked]);

    useEffect(() => {
        if (initialIsBookmarked !== undefined) {
            setIsBookmarked(initialIsBookmarked);
        }
    }, [initialIsBookmarked]);

    // ==================== 初始化 ====================
    useEffect(() => {
        if (!enabled || !id || initialized.current) return;

        initialized.current = true;

        // ✅ 已登录：使用服务端返回的 initialIsBookmarked
        if (isLoggedIn) {
            setIsBookmarked(initialIsBookmarked);
        } else {
            // ✅ 未登录：使用 localStorage
            setIsBookmarked(checkLocalBookmarked(target, id));
        }
    }, [target, id, enabled, isLoggedIn, initialIsBookmarked]);

    // ==================== 切换收藏 ====================
    const toggle = useCallback(async () => {
        if (!id || isLoading) return;

        // ✅ 未登录：触发登录弹窗
        if (!isLoggedIn || !token) {
            setNeedLogin(true);
            return;
        }

        const prevBookmarked = isBookmarked;
        const prevMarked = marked;
        const newBookmarked = !prevBookmarked;

        // ✅ 乐观更新
        setIsBookmarked(newBookmarked);
        setMarked(newBookmarked ? prevMarked + 1 : Math.max(0, prevMarked - 1));
        setIsLoading(true);

        // ✅ 立即更新 localStorage（防刷）
        if (newBookmarked) {
            markLocalBookmarked(target, id);
        } else {
            unmarkLocalBookmarked(target, id);
        }

        try {
            // ✅ 拼接 API 路径
            const endpoint =
                target === 'article'
                    ? `${API_BASE_URL}/articles/${id}/marked`
                    : `${API_BASE_URL}/formulas/${id}/marked`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    action: newBookmarked ? 'bookmark' : 'unbookmark',
                }),
            });

            // ✅ Token 失效
            if (res.status === 401) {
                setNeedLogin(true);
                // 回滚
                setIsBookmarked(prevBookmarked);
                setMarked(prevMarked);
                if (prevBookmarked) {
                    markLocalBookmarked(target, id);
                } else {
                    unmarkLocalBookmarked(target, id);
                }
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            if (data.code === 1 && data.data) {
                // ✅ 用服务端返回的准确值同步
                setMarked(data.data.marked);
                if (data.data.isBookmarked !== undefined) {
                    setIsBookmarked(data.data.isBookmarked);
                }
            } else {
                throw new Error(data.message || '收藏失败');
            }
        } catch (err) {
            console.error('收藏失败:', err);

            // ✅ 回滚
            setIsBookmarked(prevBookmarked);
            setMarked(prevMarked);

            // 回滚 localStorage
            if (prevBookmarked) {
                markLocalBookmarked(target, id);
            } else {
                unmarkLocalBookmarked(target, id);
            }
        } finally {
            setIsLoading(false);
        }
    }, [target, id, isBookmarked, marked, isLoading, isLoggedIn, token]);

    // ==================== 关闭登录弹窗 ====================
    const closeLoginModal = useCallback(() => {
        setNeedLogin(false);
    }, []);

    return {
        marked,
        isBookmarked,
        isLoading,
        toggle,
        needLogin,
        closeLoginModal,
    };
}