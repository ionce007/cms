// lib/htmlProcessor.ts
import { getProxiedImageUrl, getSiteProtocol } from './imageProxy';

/**
 * 处理 HTML 内容中的所有图片 URL
 * 
 * @param html HTML 字符串
 * @param options 配置项
 *   - protocol: 网站协议（'http:' | 'https:'）
 *   - forceProxy: 强制启用/禁用代理
 */
export function processHtmlImages(
    html: string,
    options?: {
        protocol?: 'http:' | 'https:';
        forceProxy?: boolean;
    }
): string {
    if (!html) return '';

    // ✅ 网站是 HTTP 且未强制代理 → 不做任何处理
    const protocol = options?.protocol ?? getSiteProtocol();
    const shouldProxy =
        options?.forceProxy !== undefined
            ? options.forceProxy
            : protocol === 'https:';

    if (!shouldProxy) {
        return html;
    }

    let processed = html;

    // ✅ 统一的 URL 匹配模式：http://、https://、//
    const IMG_URL_PATTERN = '(?:https?:)?\\/\\/[^"\'\\s)]+';

    // 1. <img src="...">
    processed = processed.replace(
        new RegExp(`(<img[^>]+src=["'])(${IMG_URL_PATTERN})(["'])`, 'gi'),
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url, options)}${suffix}`;
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
                    if (parts[0]) {
                        parts[0] = getProxiedImageUrl(parts[0], options);
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
            return `url("${getProxiedImageUrl(url, options)}")`;
        }
    );

    // 4. <source src="...">
    processed = processed.replace(
        new RegExp(`(<source[^>]+src=["'])(${IMG_URL_PATTERN})(["'])`, 'gi'),
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url, options)}${suffix}`;
        }
    );

    // 5. <video poster="...">
    processed = processed.replace(
        new RegExp(`(<video[^>]+poster=["'])(${IMG_URL_PATTERN})(["'])`, 'gi'),
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url, options)}${suffix}`;
        }
    );

    // 6. <a href="...jpg">
    processed = processed.replace(
        /(<a[^>]+href=["'])((?:https?:)?\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|avif))(["'])/gi,
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url, options)}${suffix}`;
        }
    );

    // 7. <style> 内的 URL
    processed = processed.replace(
        /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
        (match, open, css, close) => {
            const newCss = css.replace(
                /url\(["']?((?:https?:)?\/\/[^"')]+)["']?\)/gi,
                (m: string, url: string) =>
                    `url("${getProxiedImageUrl(url, options)}")`
            );
            return `${open}${newCss}${close}`;
        }
    );

    return processed;
}