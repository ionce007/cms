// lib/imageProxy.ts
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes';

const PROXY_PATH = `${API_BASE_URL}${API_ENDPOINTS.PROXY_IMAGE}`;

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
export function getProxiedImageUrl(
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
        return `${PROXY_PATH}?url=${encodeURIComponent(fullUrl)}`;
    }

    // HTTP 图片
    if (trimmed.startsWith('http://')) {
        return `${PROXY_PATH}?url=${encodeURIComponent(trimmed)}`;
    }

    // 其他情况直接返回
    return trimmed;
}