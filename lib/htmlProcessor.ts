// lib/htmlProcessor.ts
import { getProxiedImageUrl } from './imageProxy_ds';

/**
 * 处理 HTML 内容中的所有 HTTP 图片
 * 替换为代理 URL
 */
export function processHtmlImages(html: string): string {
    if (!html) return '';

    let processed = html;

    // 1. <img src="http://...">
    processed = processed.replace(
        /(<img[^>]+src=["'])(http:\/\/[^"']+)(["'])/gi,
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 2. srcset 多图
    processed = processed.replace(
        /(<img[^>]+srcset=["'])([^"']+)(["'])/gi,
        (match, prefix, srcset, suffix) => {
            const newSrcset = srcset
                .split(',')
                .map((item: string) => {
                    const trimmed = item.trim();
                    const parts = trimmed.split(/\s+/);
                    if (parts[0] && parts[0].startsWith('http://')) {
                        parts[0] = getProxiedImageUrl(parts[0]);
                    }
                    return parts.join(' ');
                })
                .join(', ');
            return `${prefix}${newSrcset}${suffix}`;
        }
    );

    // 3. background-image: url(http://...)
    processed = processed.replace(
        /url\(["']?(http:\/\/[^"')]+)["']?\)/gi,
        (match, url) => {
            return `url("${getProxiedImageUrl(url)}")`;
        }
    );

    // 4. <source src="http://...">
    processed = processed.replace(
        /(<source[^>]+src=["'])(http:\/\/[^"']+)(["'])/gi,
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 5. <video poster="http://...">
    processed = processed.replace(
        /(<video[^>]+poster=["'])(http:\/\/[^"']+)(["'])/gi,
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 6. <a href="http://...jpg">
    processed = processed.replace(
        /(<a[^>]+href=["'])(http:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp|svg|bmp|avif))(["'])/gi,
        (match, prefix, url, suffix) => {
            return `${prefix}${getProxiedImageUrl(url)}${suffix}`;
        }
    );

    // 7. <style> 标签内的 URL
    processed = processed.replace(
        /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
        (match, open, css, close) => {
            const newCss = css.replace(
                /url\(["']?(http:\/\/[^"')]+)["']?\)/gi,
                (m: string, url: string) => `url("${getProxiedImageUrl(url)}")`
            );
            return `${open}${newCss}${close}`;
        }
    );

    return processed;
}