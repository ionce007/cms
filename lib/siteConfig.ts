// lib/siteConfig.ts
import { cache } from 'react';
import { API_BASE_URL } from '@/config/env';
import { SiteConfig, DEFAULT_SITE_CONFIG, mergeSiteConfig, } from '@/config/site';

/**
 * ✅ 服务端获取站点配置
 * 使用 React cache() 保证同一请求中只请求一次
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
    const siteInfoUrl = `${API_BASE_URL}/siteinfo`;

    try {
        const res = await fetch(siteInfoUrl, {
            // ✅ 缓存 5 分钟，减少请求
            next: { revalidate: 300 },
        });

        if (!res.ok) {
            return DEFAULT_SITE_CONFIG;
        }

        const json = await res.json();

        if (json?.code !== 1 || !json?.data) {
            return DEFAULT_SITE_CONFIG;
        }

        return mergeSiteConfig(json.data);
    } catch {
        // edgeone makers dev / build 在本地没有对应后端时，不应因为
        // fetch ECONNREFUSED 直接中断页面构建；直接使用默认站点配置。
        return DEFAULT_SITE_CONFIG;
    }
});