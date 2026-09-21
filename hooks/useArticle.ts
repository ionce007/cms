// hooks/useArticle.ts
import useSWR from 'swr';
import { FrontendArticle1 } from '@/types/frontend';

const baseUrl = process.env.API_URL || 'https://blog.foryet.com/api';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('请求失败');
    const json = await res.json();
    return json;
};

export function useArticle(id: number) {
    // ✅ 同时调用多个 API
    const articleSWR = useSWR(
        `${baseUrl}/articles/${id}`,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60000 }
    );

    const relatedSWR = useSWR(
        `${baseUrl}/articles/${id}/related`,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60000 }
    );

    const commentsSWR = useSWR(
        id ? `${baseUrl}/articles/${id}/comments` : null,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 60000 }
    );

    const authorSWR = useSWR(
        articleSWR.data?.data?.cid
            ? `${baseUrl}/categories/${articleSWR.data.data.cid}`
            : null,
        fetcher,  // ✅ 依赖第一个 API 的结果
        { revalidateOnFocus: false }
    );

    // ✅ 组合加载状态
    const isLoading = articleSWR.isLoading || relatedSWR.isLoading;// || commentsSWR.isLoading;

    // ✅ 计算进度
    const apis = [articleSWR, relatedSWR];//, commentsSWR];
    const completed = apis.filter(s => !s.isLoading && s.data).length;
    const progress = Math.round((completed / apis.length) * 100);

    return {
        // 数据
        article: articleSWR.data?.article || null,
        relatedArticles: relatedSWR.data?.data || [],
        //comments: commentsSWR.data?.data || [],
        //category: authorSWR.data?.data || null,

        // 状态
        isLoading,
        isLoaded: !isLoading,
        progress,
        loadingStates: {
            article: !articleSWR.isLoading,
            related: !relatedSWR.isLoading,
            //comments: !commentsSWR.isLoading,
        },

        // 错误
        error: articleSWR.error || relatedSWR.error,// || commentsSWR.error,

        // 刷新
        refresh: () => {
            articleSWR.mutate();
            relatedSWR.mutate();
            //commentsSWR.mutate();
        },
    };
}