// hooks/useArticleDetail.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { FrontendArticle1 } from '@/types/frontend';
import { useSidebarData } from './useCommonData';

const baseUrl = process.env.API_URL || 'https://blog.foryet.com/api';

// ========== 类型定义 ==========
interface UseArticleDetailResult {
    article: FrontendArticle1 | null;
    relatedArticles: FrontendArticle1[];
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * 获取单个文章详情
 */
export function useArticleDetail(articleId: number): UseArticleDetailResult {
    const [article, setArticle] = useState<FrontendArticle1 | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<FrontendArticle1[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!articleId) {
            setIsLoading(false);
            setIsLoaded(true);
            return;
        }

        setIsLoading(true);
        setIsLoaded(false);
        setError(null);

        try {
            // ✅ 并行请求：文章详情 + 关联文章
            const [articleRes, relatedRes] = await Promise.allSettled([
                fetch(`${baseUrl}/articles/${articleId}`),
                fetch(`${baseUrl}/articles/${articleId}/related`),
            ]);
            // 处理文章详情
            if (articleRes.status === 'fulfilled' && articleRes.value.ok) {
                const data = await articleRes.value.json();
                if (data && (data.code === 1 || data.code === 200)) {
                    setArticle(data.article || null);
                } else {
                    setError(data.message || '文章不存在');
                    setArticle(null);
                }
            } else {
                setError('获取文章失败');
                setArticle(null);
            }

            // 处理关联文章（失败不影响主内容）
            if (relatedRes.status === 'fulfilled' && relatedRes.value.ok) {
                const data = await relatedRes.value.json();
                if (data && (data.code === 1 || data.code === 200)) {
                    setRelatedArticles(data.articles || []);
                } else {
                    setRelatedArticles([]);
                }
            } else {
                setRelatedArticles([]);
            }
        } catch (err) {
            console.error('获取文章失败:', err);
            setError(err instanceof Error ? err.message : '加载失败');
            setArticle(null);
            setRelatedArticles([]);
        } finally {
            setIsLoading(false);
            setIsLoaded(true);
        }
    }, [articleId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        article,
        relatedArticles,
        isLoading,
        isLoaded,
        error,
        refresh: fetchData,
    };
}

/**
 * ✅ 组合 Hook：文章详情 + 关联文章 + 侧边栏数据 + 统一进度
 */
export function useArticleDetailWithSidebar(articleId: number) {
    const articleSWR = useArticleDetail(articleId);
    const sidebar = useSidebarData();
    // ✅ 组合加载状态：侧边栏 4 项 + 文章详情 1 项 + 关联文章 1 项
    const loadingStates = {
        ...sidebar.loadingStates,
        article: articleSWR.isLoaded,
        related: articleSWR.isLoaded,  // 与 article 同一批次加载
    };

    const completed = Object.values(loadingStates).filter(Boolean).length;
    const total = Object.values(loadingStates).length;
    const progress = Math.round((completed / total) * 100);
    const isAllLoaded = completed === total;

    const getLoadingMessage = () => {
        const pending: string[] = [];
        if (!loadingStates.categories) pending.push('分类');
        if (!loadingStates.tags) pending.push('标签');
        if (!loadingStates.popularArticles) pending.push('热门文章');
        if (!loadingStates.featuredArticles) pending.push('精选文章');
        if (!loadingStates.article) pending.push('文章内容');
        if (pending.length === 0) return '加载完成！';
        return `正在加载：${pending.join('、')}...`;
    };

    return {
        // 文章数据
        article: articleSWR.article,
        relatedArticles: articleSWR.relatedArticles,
        articleError: articleSWR.error,

        // 侧边栏数据
        categories: sidebar.categories,
        tags: sidebar.tags,
        popularPosts: sidebar.popularArticles,
        featuredArticles: sidebar.featuredArticles,

        // 进度
        progress,
        loadingStates,
        loadingMessage: getLoadingMessage(),
        isAllLoaded,
        hasError: articleSWR.error || sidebar.hasError,
    };
}