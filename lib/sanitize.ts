// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';
import { getProxiedImageUrl } from './imageProxy';

export function sanitizeCommentHtml(html: string): string {
    if (!html) return '';

    // 1. 先净化
    let clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
            'a', 'img', 'code', 'pre', 'blockquote',
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
        ],
        ALLOWED_ATTR: [
            'href', 'target', 'rel',
            'src', 'alt', 'width', 'height', 'style',
            'data-original-src',
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    });

    // 2. 服务端渲染时不处理（无 window）
    if (typeof window === 'undefined') {
        return clean;
    }

    // 3. ✅ 把 img 的 src 换成代理 URL
    //    用 DOMParser 避免正则误伤
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(clean, 'text/html');

        doc.querySelectorAll('img').forEach(img => {
            const rawSrc = img.getAttribute('src');
            if (!rawSrc) return;

            // 优先用 data-original-src（如果存在）
            const originalSrc =
                img.getAttribute('data-original-src') || rawSrc;

            const proxied = getProxiedImageUrl(originalSrc, {
                forceProxy: true,
            });

            img.setAttribute('src', proxied);
            // ✅ 保留原始 URL，方便后续使用
            if (!img.getAttribute('data-original-src')) {
                img.setAttribute('data-original-src', originalSrc);
            }
            // 图片懒加载
            img.setAttribute('loading', 'lazy');
        });

        return doc.body.innerHTML;
    } catch {
        // 出错则返回净化后的 HTML
        return clean;
    }
}