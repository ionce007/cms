// lib/imageProxy.ts

// ✅ 后端图片代理地址（Express）
const API_BASE_URL = process.env.API_URL || 'https://blog.foryet.com/api';

const PROXY_PATH = `${API_BASE_URL}/img/proxy`;

/**
 * 将 HTTP 图片 URL 转换为 HTTPS 代理 URL
 */
export function getProxiedImageUrl(url: string | Blob): string {
    if (url instanceof Blob) {
        return URL.createObjectURL(url);
    }
    if (!url || url.trim() === '') return '';

    const trimmed = url.trim();

    // 已经是相对路径或 HTTPS，直接返回
    if ((trimmed.startsWith('/') && !trimmed.startsWith('//')) || trimmed.startsWith('https://')) {
        return trimmed;
    }

    // data: / blob: 直接返回
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // ✅ HTTP 图片，走后端代理
    if (trimmed.startsWith('http://') || trimmed.startsWith('//img.foryet.com')) {
        const imgUrl = trimmed.startsWith('//img.foryet.com') ? `http:${trimmed}` : trimmed;
        return `${PROXY_PATH}?url=${encodeURIComponent(imgUrl)}`;
    }

    return trimmed;
}