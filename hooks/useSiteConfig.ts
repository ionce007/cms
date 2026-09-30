// hooks/useSiteConfig.ts
'use client';

import useSWR from 'swr';
import { API_BASE_URL } from '@/config/env';
import { SiteConfig, DEFAULT_SITE_CONFIG, mergeSiteConfig, } from '@/config/site';

const fetcher = async (url: string): Promise<SiteConfig> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 1 || !json.data) {
        throw new Error(json.message || '获取站点配置失败');
    }
    return mergeSiteConfig(json.data);
};

export function useSiteConfig() {
    const { data, error, isLoading } = useSWR<SiteConfig>(
        `${API_BASE_URL}/siteinfo`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
            // ✅ 失败时使用默认值
            fallbackData: DEFAULT_SITE_CONFIG,
        }
    );

    return {
        siteConfig: data || DEFAULT_SITE_CONFIG,
        isLoading,
        isLoaded: !isLoading && !!data,
        error,
    };
}