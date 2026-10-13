// hooks/useArticle.ts
'use client';

import useSWR from 'swr';
import { API_BASE_URL } from '@/config/env';
import { FrontendArticle } from '@/types/frontend';
import { useAuth } from '@/contexts/AuthContext';

const fetcher = async ([url, token]: [string, string | null]) => {
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
};

export function useArticle(id: number) {
    const { token, isLoading: authLoading } = useAuth();

    // ✅ 关键1：authLoading 为 true 时，key = null → 不发请求
    const articleSWR = useSWR(
        id && !authLoading
            ? [`${API_BASE_URL}/articles/${id}`, token]
            : null,  // ← 不发请求
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60000 }
    );

    const relatedSWR = useSWR(
        id && !authLoading
            ? [`${API_BASE_URL}/articles/${id}/related`, token]
            : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60000 }
    );

    const apis = [articleSWR, relatedSWR];
    const isLoading = apis.some(s => s.isLoading);
    const completed = apis.filter(s => !s.isLoading && s.data).length;
    const progress = Math.round((completed / apis.length) * 100);

    return {
        article: (
            articleSWR.data?.data ||
            articleSWR.data?.article ||
            null
        ) as FrontendArticle | null,
        relatedArticles: (
            relatedSWR.data?.data ||
            relatedSWR.data?.articles ||
            []
        ) as FrontendArticle[],
        // ✅ 关键2：authLoading 也纳入 isLoading
        isLoading: isLoading || authLoading,
        isLoaded: !isLoading && !authLoading,
        progress,
        loadingStates: {
            article: !articleSWR.isLoading,
            related: !relatedSWR.isLoading,
        },
        error: articleSWR.error || relatedSWR.error,
        refresh: () => {
            articleSWR.mutate();
            relatedSWR.mutate();
        },
    };
}