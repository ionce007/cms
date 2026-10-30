// lib/imageProxy.ts
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes';

const PROXY_PATH = `${API_BASE_URL}${API_ENDPOINTS.PROXY_IMAGE}`;

/**
 * 判断是否为图片代理 URL
 */
export function isProxyUrl(url: string): boolean {
    return url.includes(PROXY_PATH) || url.startsWith('/api/imgproxy');
}

/**
 * 获取当前网站协议
 * - 客户端：从 window.location 获取
 * - 服务端：默认返回 'https:'（生产环境）
 */
export function getSiteProtocol(): 'http:' | 'https:' {
    // ✅ 客户端环境
    if (typeof window !== 'undefined' && window.location) {
        return window.location.protocol === 'http:' ? 'http:' : 'https:';
    }

    // ✅ 服务端环境：默认按 https 处理（生产环境一般用 https）
    // 如需精确控制，可通过环境变量传递
    return 'https:';
}

/**
 * 判断当前网站是否为 HTTPS
 */
export function isHttpsSite(): boolean {
    return getSiteProtocol() === 'https:';
}

/**
 * 将图片 URL 转换为代理 URL
 * 
 * 规则：
 * - 网站是 HTTP：不做处理，返回原 URL
 * - 网站是 HTTPS：
 *   - http://    → 走代理
 *   - //         → 走代理（补全为 http://）
 *   - https://   → 直接返回
 *   - /path      → 直接返回
 *   - data:      → 直接返回
 */
export function getProxiedImageUrl_Old(
    url: string | Blob | null | undefined,
    options?: {
        /**
         * 强制指定协议
         * - 'http:' → 不代理
         * - 'https:' → 代理
         * - 不传 → 自动判断
         */
        protocol?: 'http:' | 'https:';
        /**
         * 强制启用/禁用代理
         * - true → 强制代理
         * - false → 强制不代理
         * - 不传 → 根据协议自动判断
         */
        forceProxy?: boolean;
    }
): string {
    if (url === null || url === undefined) return '';

    if (typeof Blob !== 'undefined' && url instanceof Blob) {
        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
            return URL.createObjectURL(url);
        }
        return '';
    }

    const value = String(url);
    if (value.trim() === '') return '';

    const trimmed = value.trim();

    // ✅ data: / blob: 直接返回
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // ✅ 已是 HTTPS，直接返回
    if (trimmed.startsWith('https://')) {
        return trimmed;
    }

    // ✅ 相对路径，直接返回
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
        return trimmed;
    }

    // ✅ 判断是否需要代理
    const protocol = options?.protocol ?? getSiteProtocol();
    const shouldProxy = options?.forceProxy !== undefined ? options.forceProxy : protocol === 'https:';

    // ✅ 网站是 HTTP，不代理，直接返回原 URL
    if (!shouldProxy) {
        // 补全协议相对 URL（//example.com/a.jpg → http://example.com/a.jpg）
        if (trimmed.startsWith('//')) {
            return `http:${trimmed}`;
        }
        return trimmed;
    }

    // ✅ 需要代理，走代理逻辑

    // 协议相对 URL（//img-server.com/a.jpg）
    if (trimmed.startsWith('//')) {
        const fullUrl = `http:${trimmed}`;
        //return `${PROXY_PATH}?url=${encodeURIComponent(fullUrl)}`;
    }
    //图片网址 协议与 网站协议 相同时，不做图片代理
    if(trimmed.toLocaleLowerCase().startsWith(protocol.toLocaleLowerCase())) return trimmed;
    // HTTP 图片
    if (trimmed.startsWith('http://')) {
        return `${PROXY_PATH}?url=${encodeURIComponent(trimmed)}`;
    }

    // 其他情况直接返回
    return trimmed;
}

/**
 * 将图片 URL 转换为 HTTPS 代理 URL
 * 
 * - HTTP 图片 → 代理 URL
 * - HTTPS 图片 → 原样返回
 * - 相对路径 → 原样返回
 * - 已经是代理 URL → 原样返回
 */
export function getProxiedImageUrl(
    url: string | null | undefined,
    options?: {
        /** 强制指定协议：'http:' 不代理 | 'https:' 代理 */
        protocol?: 'http:' | 'https:';
        /** 强制代理 */
        forceProxy?: boolean;
    }
): string {
    if (!url || url.trim() === '') return '';
    if(url.trim().startsWith('//')) url = `http:${url.trim()}`;
    const trimmed = url.trim();

    // data: / blob: 直接返回
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // 已是代理 URL，避免双重代理
    if (isProxyUrl(trimmed)) {
        return trimmed;
    }

    // HTTPS 图片直接返回
    if (trimmed.startsWith('https://')) {
        return trimmed;
    }

    // 相对路径直接返回
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
        return trimmed;
    }

    // ✅ 判断是否需要代理
    const protocol = options?.protocol ?? (typeof window !== 'undefined' ? window.location.protocol as 'http:' | 'https:' : 'https:');
    //图片网址协议 与 网站协议 相同时，不使用图片代理。
    if(trimmed.toLocaleLowerCase().startsWith(protocol)) return trimmed; 
    
    const shouldProxy = options?.forceProxy !== undefined
        ? options.forceProxy
        : protocol === 'https:';

    // HTTP 站点不代理
    if (!shouldProxy) {
        if (trimmed.startsWith('//')) {
            return `http:${trimmed}`;
        }
        return trimmed;
    }

    // ✅ 需要代理：转换为代理 URL
    if (trimmed.startsWith('//')) {
        const fullUrl = `http:${trimmed}`;
        return `${PROXY_PATH}?url=${encodeURIComponent(fullUrl)}`;
    }

    if (trimmed.startsWith('http://')) {
        return `${PROXY_PATH}?url=${encodeURIComponent(trimmed)}`;
    }

    return trimmed;
}

/**
 * ✅ 从代理 URL 还原为原始 URL
 * 
 * 用于提交前：将编辑器中的代理 URL 还原为 HTTP 原始地址
 */
export function getOriginalImageUrl(proxyUrl: string): string {
    if (!proxyUrl) return '';

    const trimmed = proxyUrl.trim();

    // 不是代理 URL，直接返回
    if (!isProxyUrl(trimmed)) {
        return trimmed;
    }

    try {
        // 提取 url 参数
        // 支持：/api/proxy-image?url=http%3A%2F%2F...
        // 或：https://site.com/api/proxy-image?url=...
        let urlParam: string | null = null;

        if (trimmed.startsWith('http')) {
            // 完整 URL
            const urlObj = new URL(trimmed);
            urlParam = urlObj.searchParams.get('url');
        } else {
            // 相对 URL
            const queryString = trimmed.split('?')[1];
            if (queryString) {
                const params = new URLSearchParams(queryString);
                urlParam = params.get('url');
            }
        }

        if (urlParam) {
            return decodeURIComponent(urlParam);
        }
    } catch (err) {
        console.warn('解析代理 URL 失败:', err);
    }

    return proxyUrl;
}

/**
 * ✅ 批量还原 HTML 中的代理图片 URL
 * 
 * 用于提交前：将 HTML 中所有代理图片 URL 还原为原始地址
 */
export function restoreOriginalImageUrls(html: string): string {
    if (!html) return '';

    // 匹配 <img src="..."> 或 <img src='...'>
    return html.replace(
        /(<img[^>]+src=["'])([^"']+)(["'])/gi,
        (match, prefix, url, suffix) => {
            const originalUrl = getOriginalImageUrl(url);
            return `${prefix}${originalUrl}${suffix}`;
        }
    );
}

/**
 * ✅ 批量替换 HTML 中的 HTTP 图片 URL 为代理 URL
 * 
 * 用于渲染时：将存储的 HTTP 图片 URL 转换为代理 URL
 */
export function proxyHtmlImageUrls(html: string): string {
    if (!html) return '';

    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const shouldProxy = protocol === 'https:';

    // HTTP 站点不代理
    if (!shouldProxy) {
        return html;
    }

    // 匹配 <img src="..."> 或 <img src='...'>
    return html.replace(
        /(<img[^>]+src=["'])([^"']+)(["'])/gi,
        (match, prefix, url, suffix) => {
            const proxiedUrl = getProxiedImageUrl(url, { forceProxy: true });
            return `${prefix}${proxiedUrl}${suffix}`;
        }
    );
}