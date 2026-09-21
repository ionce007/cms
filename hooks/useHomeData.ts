// hooks/useHomeData.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { defaultArticle, FrontendArticle1 } from '@/types/frontend';
import { useSidebarData } from './useCommonData';

const baseUrl = process.env.API_URL || 'http://localhost:8088/api';

interface UseHomeDataResult {
    featuredArticle: FrontendArticle1 | null;
    recentArticles: FrontendArticle1[];
    isLoading: boolean;
    isLoaded: boolean;
    progress: number;
    loadingStates: Record<string, boolean>;
    loadingMessage: string;
    error: string | null;
    refresh: () => void;
}

/**
 * 首页数据 Hook
 * 同时请求：置顶文章 + 最新文章 + 侧边栏数据
 */
export function useHomeData(): UseHomeDataResult {
    // 首页专属数据
    const [featuredArticle, setFeaturedArticle] = useState<FrontendArticle1 | null>(null);
    const [recentArticles, setRecentArticles] = useState<FrontendArticle1[]>([]);
    const [featuredLoaded, setFeaturedLoaded] = useState(false);
    const [recentLoaded, setRecentLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 侧边栏数据（分类、标签、热门、精选）
    const sidebar = useSidebarData();

    const fetchData = useCallback(async () => {
        setError(null);
        setFeaturedLoaded(false);
        setRecentLoaded(false);

        // ✅ 并行请求两个 API
        const [featuredResult, recentResult] = await Promise.allSettled([
            fetch(`${baseUrl}/articles/pinned`, { cache: 'no-store' }),
            fetch(`${baseUrl}/articles/recent`, { cache: 'no-store' }),
        ]);

        // 处理置顶文章
        try {
            if (featuredResult.status === 'fulfilled' && featuredResult.value.ok) {
                const json = await featuredResult.value.json();
                const article: FrontendArticle1 = {
                    ...json.data,
                    Category: json.data.category || (json.data as any).Category,
                    Tags: json.data.tags,
                };
                setFeaturedArticle(article || defaultArticle);
            } else {
                setFeaturedArticle(defaultArticle);
            }
        } catch (err) {
            console.error('获取置顶文章失败:', err);
            setFeaturedArticle(defaultArticle);
        } finally {
            setFeaturedLoaded(true);
        }

        // 处理最新文章
        try {
            if (recentResult.status === 'fulfilled' && recentResult.value.ok) {
                const json = await recentResult.value.json();
                setRecentArticles(Array.isArray(json.data) ? json.data : []);
            } else {
                setRecentArticles([]);
            }
        } catch (err) {
            console.error('获取最新文章失败:', err);
            setRecentArticles([]);
        } finally {
            setRecentLoaded(true);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ✅ 组合所有加载状态（首页 2 项 + 侧边栏 4 项 = 6 项）
    const loadingStates: Record<string, boolean> = {
        ...sidebar.loadingStates,
        featured: featuredLoaded,
        recent: recentLoaded,
    };

    const completed = Object.values(loadingStates).filter(Boolean).length;
    const total = Object.values(loadingStates).length;
    const progress = Math.round((completed / total) * 100);
    const isAllLoaded = completed === total;

    // ✅ 加载提示文案
    const getLoadingMessage = () => {
        const pending: string[] = [];
        if (!loadingStates.categories) pending.push('分类');
        if (!loadingStates.tags) pending.push('标签');
        if (!loadingStates.popularPosts) pending.push('热门文章');
        if (!loadingStates.featuredArticles) pending.push('精选文章');
        if (!loadingStates.featured) pending.push('置顶文章');
        if (!loadingStates.recent) pending.push('最新文章');
        if (pending.length === 0) return '加载完成！';
        return `正在加载：${pending.join('、')}...`;
    };

    return {
        featuredArticle,
        recentArticles,
        isLoading: !isAllLoaded,
        isLoaded: isAllLoaded,
        progress,
        loadingStates,
        loadingMessage: getLoadingMessage(),
        error,
        refresh: fetchData,
    };
}