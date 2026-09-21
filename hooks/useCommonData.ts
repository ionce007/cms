// hooks/useCommonData.ts
import useSWR from 'swr';
import { Category1, Tag, FrontendArticle1, SiteInfo, FragInfo, defaultSiteInfo } from '@/types/frontend';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('请求失败');
    const json = await res.json();
    return json.data || [];
};

export function useCategories() {
    return useSWR<Category1[]>(`${baseUrl}/categories`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3, // 3分钟内不重复请求
    });
}
export function useCategoryArticles(slug: string) {
    return useSWR<Category1[]>(`${baseUrl}/categories/${slug}`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3, // 3分钟内不重复请求
    });
}
export function useArticles() {
    return useSWR<Tag[]>(`${baseUrl}/articles`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3,
    });
}
export function useTags() {
    return useSWR<Tag[]>(`${baseUrl}/tags`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3,
    });
}
export function useFrag(mark: string) {
    const { data, error, isLoading } = useSWR<FragInfo>(
        mark ? `${baseUrl}/frags/mark/${mark}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    return {
        frag: data,
        isLoading,
        isLoaded: !isLoading && !!data,
        error,
    };
}
export function usePopularArticles() {
    return useSWR<FrontendArticle1[]>(`${baseUrl}/articles/popular`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3,
    });
}

export function useFeaturedArticles() {
    return useSWR<FrontendArticle1[]>(`${baseUrl}/articles/featured`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3,
    });
}

export function useSiteInfoData() {
    return useSWR<SiteInfo>(`${baseUrl}/siteinfo`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3,
    });
}

export function useSiteInfo() {
    const { data, error, isLoading } = useSWR<SiteInfo>(`${baseUrl}/siteinfo`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3,
    });

    return {
        siteinfo: data,
        isLoading,
        isLoaded: !isLoading && !!data,
        error,
    };
}

export function useFragData() {
    return useSWR<FragInfo[]>(`${baseUrl}/frags`, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 60000 * 3,
    });
}
// ✅ 组合 Hook：一次获取所有侧边栏数据
export function useSidebarData() {
    const categories = useCategories();
    const tags = useTags();
    const popularArticles = usePopularArticles();
    const featuredArticles = useFeaturedArticles();
    const siteInfo = useSiteInfoData();
    const frags = useFragData();

    // 每个数据源的加载状态
    const loadingStates = {
        categories: !categories.isLoading,
        tags: !tags.isLoading,
        popularArticles: !popularArticles.isLoading,
        featuredArticles: !featuredArticles.isLoading,
        siteInfo: !siteInfo.isLoading,
        frags: !frags.isLoading,
    };

    // 计算进度
    const completed = Object.values(loadingStates).filter(Boolean).length;
    const total = Object.values(loadingStates).length;
    const progress = Math.round((completed / total) * 100);

    // 是否全部加载完成
    const isAllLoaded = completed === total;

    // 加载中文案
    const getLoadingMessage = () => {
        const pending: string[] = [];
        if (!loadingStates.categories) pending.push('分类');
        if (!loadingStates.tags) pending.push('标签');
        if (!loadingStates.popularArticles) pending.push('热门文章');
        if (!loadingStates.featuredArticles) pending.push('精选文章');
        if (!loadingStates.siteInfo) pending.push('网站信息');
        if (!loadingStates.frags) pending.push('其它数据');

        if (pending.length === 0) return '加载完成！';
        return `正在加载：${pending.join('、')}...`;
    };

    return {
        // 数据
        categories: categories.data || [],
        tags: tags.data || [],
        popularArticles: popularArticles.data || [],
        featuredArticles: featuredArticles.data || [],
        siteInfo: siteInfo.data || defaultSiteInfo,
        frags: frags.data || [],

        // 状态
        loadingStates,
        isAllLoaded,
        progress,
        loadingMessage: getLoadingMessage(),

        // 错误
        hasError: categories.error || tags.error || popularArticles.error || featuredArticles.error || siteInfo.error || frags.error,
    };
}
/*
export function useSiderbarData() {
    const categories = useCategories();
    const tags = useTags();
    const popular = usePopularArticles();
    const featured = useFeaturedArticles();
    const siteinfo = useSiteData();
    const frags = useFragData();

    const loading =
        categories.isLoading ||
        tags.isLoading ||
        popular.isLoading ||
        featured.isLoading ||
        siteinfo.isLoading ||
        frags.isLoading;

    const completed = [
        categories.data,
        tags.data,
        popular.data,
        featured.data,
        siteinfo.data,
        frags.data
    ].filter(Boolean).length;

    const progress = Math.round((completed / 6) * 100);

    return {
        categories: categories.data || [],
        tags: tags.data || [],
        popularPosts: popular.data || [],
        featuredArticles: featured.data || [],
        siteInfo: siteinfo.data || {},
        frags: frags.data || [],
        loading,
        progress,
        loadingStates: {
            categories: !categories.isLoading,
            tags: !tags.isLoading,
            popularPosts: !popular.isLoading,
            featuredArticles: !featured.isLoading,
            siteInfo: !siteinfo.isLoading,
            frags: !frags.isLoading
        },
    };
}
*/