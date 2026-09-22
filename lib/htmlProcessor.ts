// lib/htmlProcessor.ts
import { getProxiedImageUrl } from './imageProxy';

/**
 * 处理 HTML 内容中的所有图片 URL
 * 支持 http://、//（协议相对）、https://
 */
export function processHtmlImages(html: string): string {
    if (!html) return '';

    let processed = html;

    // ✅ 统一的正则：匹配 http:// 或 // 开头的 URL
    // (?:https?:)?\/\/  →  匹配 http://、https://、//
    const IMG_URL_PATTERN = '(?:https?:)?\\/\\/[^"\'\\s)]+';

    // 1. <img src="...">
    processed = processed.replace(
        new RegExp(`(<img[^>]+src=["'])(${IMG_URL_PATTERN})(["'])`, 'gi'),
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 2. <img srcset="...">
    processed = processed.replace(
        /(<img[^>]+srcset=["'])([^"']+)(["'])/gi,
        (match, prefix, srcset, suffix) => {
            const newSrcset = srcset
                .split(',')
                .map((item: string) => {
                    const trimmed = item.trim();
                    const parts = trimmed.split(/\s+/);
                    // ✅ 用 getProxiedImageUrl 统一处理
                    if (parts[0]) {
                        parts[0] = getProxiedImageUrl(parts[0]);
                    }
                    return parts.join(' ');
                })
                .join(', ');
            return `${prefix}${newSrcset}${suffix}`;
        }
    );

    // 3. background-image: url(...)
    processed = processed.replace(
        /url\(["']?((?:https?:)?\/\/[^"')]+)["']?\)/gi,
        (match, url) => {
            return `url("${getProxiedImageUrl(url)}")`;
        }
    );

    // 4. <source src="...">
    processed = processed.replace(
        new RegExp(`(<source[^>]+src=["'])(${IMG_URL_PATTERN})(["'])`, 'gi'),
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 5. <video poster="...">
    processed = processed.replace(
        new RegExp(`(<video[^>]+poster=["'])(${IMG_URL_PATTERN})(["'])`, 'gi'),
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 6. <a href="...jpg">
    processed = processed.replace(
        /(<a[^>]+href=["'])((?:https?:)?\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|avif))(["'])/gi,
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 7. <style> 内的 URL
    processed = processed.replace(
        /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
        (match, open, css, close) => {
            const newCss = css.replace(
                /url\(["']?((?:https?:)?\/\/[^"')]+)["']?\)/gi,
                (m: string, url: string) => `url("${getProxiedImageUrl(url)}")`
            );
            return `${open}${newCss}${close}`;
        }
    );

    return processed;
}