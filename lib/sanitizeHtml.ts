// lib/sanitizeHtml.ts
import DOMPurify from 'isomorphic-dompurify';

// ============================================================
// ✅ HTML 白名单配置（支持富文本 + 图片 + 表格 + 代码 + 样式）
// ============================================================

/**
 * 允许的 HTML 标签
 */
const ALLOWED_TAGS = [
    // 基础文本
    'p', 'br', 'div', 'span',
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark',
    'sub', 'sup',
    // 标题
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // 列表
    'ul', 'ol', 'li',
    // 引用 / 代码
    'blockquote', 'code', 'pre',
    // 链接
    'a',
    // 图片
    'img',
    // 表格
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // 分隔线
    'hr',
    // 字体（execCommand 生成）
    'font',
];

/**
 * 允许的属性
 */
const ALLOWED_ATTR = [
    // 通用
    'style', 'class', 'align', 'title',
    // 链接
    'href', 'target', 'rel',
    // 图片
    'src', 'alt', 'width', 'height', 'loading',
    // 表格
    'border', 'cellpadding', 'cellspacing',
    'colspan', 'rowspan', 'valign',
    // 字体
    'color', 'face', 'size',
    // 列表
    'start', 'type', 'value',
];

/**
 * 允许的 CSS 样式（正则白名单）
 */
const ALLOWED_STYLES: Record<string, RegExp[]> = {
    // 颜色
    'color': [/^#?[a-zA-Z0-9(),.\s%\-]+$/],
    'background': [/.*/],
    'background-color': [/.*/],
    // 字体
    'font-family': [/.*/],
    'font-size': [/^\d+(\.\d+)?(px|pt|em|rem|%)?$/],
    'font-weight': [/^(normal|bold|bolder|lighter|[1-9]00)$/],
    'font-style': [/^(normal|italic|oblique)$/],
    'text-decoration': [/.*/],
    // 对齐
    'text-align': [/^(left|right|center|justify)$/],
    'vertical-align': [/^(top|middle|bottom|baseline)$/],
    // 尺寸
    'width': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
    'height': [/^\d+(\.\d+)?(px|%|em|rem)?$/],
    'max-width': [/.*/],
    'max-height': [/.*/],
    'min-width': [/.*/],
    'min-height': [/.*/],
    // 间距
    'margin': [/.*/],
    'margin-top': [/.*/],
    'margin-right': [/.*/],
    'margin-bottom': [/.*/],
    'margin-left': [/.*/],
    'padding': [/.*/],
    'padding-top': [/.*/],
    'padding-right': [/.*/],
    'padding-bottom': [/.*/],
    'padding-left': [/.*/],
    // 边框
    'border': [/.*/],
    'border-top': [/.*/],
    'border-right': [/.*/],
    'border-bottom': [/.*/],
    'border-left': [/.*/],
    'border-radius': [/.*/],
    'border-collapse': [/.*/],
    'border-color': [/.*/],
    'border-style': [/.*/],
    'border-width': [/.*/],
    // 显示
    'display': [/.*/],
    'line-height': [/.*/],
    'letter-spacing': [/.*/],
    'white-space': [/.*/],
    'word-break': [/.*/],
    'word-wrap': [/.*/],
    // 其他
    'float': [/^(left|right|none)$/],
    'opacity': [/.*/],
    'overflow': [/.*/],
    'text-indent': [/.*/],
};

// ============================================================
// ✅ DOMPurify 配置
// ============================================================

/**
 * DOMPurify 配置
 */
const PURIFY_CONFIG = {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // 允许 data 属性（保留空）
    ALLOW_DATA_ATTR: false,
    // 允许未知协议（禁用）
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // ✅ 允许的 URI 协议
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // ✅ 保留内容（即使标签被移除）
    KEEP_CONTENT: true,
    // ✅ 移除 script/style（保持默认行为）
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // ✅ 保留 HTML 注释（按需，建议 false）
    ALLOW_ARIA_ATTR: true,
    // ✅ 允许自定义元素（禁用）
    CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: null,
        attributeNameCheck: null,
        allowCustomizedBuiltInElements: false,
    },
};

/**
 * Hook：自动处理富文本标签
 */
let hookRegistered = false;

function registerPurifyHooks() {
    if (hookRegistered || typeof window === 'undefined') return;
    hookRegistered = true;

    // ✅ 所有 <a> 标签加 noopener
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A') {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer nofollow');
        }

        // ✅ 图片自动加 loading 和 max-width
        if (node.tagName === 'IMG') {
            node.setAttribute('loading', 'lazy');
            node.setAttribute('referrerpolicy', 'no-referrer');

            // 确保 max-width: 100%
            const style = node.getAttribute('style') || '';
            if (!style.includes('max-width')) {
                node.setAttribute(
                    'style',
                    `max-width: 100%; height: auto; ${style}`
                );
            }
        }

        // ✅ 表格加默认边框（如果没样式）
        if (node.tagName === 'TABLE') {
            const style = node.getAttribute('style') || '';
            if (!style.includes('border')) {
                node.setAttribute(
                    'style',
                    `${style} border-collapse: collapse; width: 100%;`
                );
            }
        }
    });
}

// ============================================================
// ✅ 主要导出函数
// ============================================================

/**
 * 清洗 HTML（前端）
 * - 移除 script、iframe 等危险标签
 * - 移除事件属性（onclick 等）
 * - 保留富文本格式（图片、表格、代码等）
 * - 限制 CSS 样式白名单
 *
 * @param html 原始 HTML 字符串
 * @returns 清洗后的安全 HTML
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    // SSR 环境：简单处理
    if (typeof window === 'undefined') {
        return html;
    }

    registerPurifyHooks();

    try {
        const clean = DOMPurify.sanitize(html, PURIFY_CONFIG);
        return clean;
    } catch (err) {
        console.error('sanitizeHtml error:', err);
        // 清洗失败，返回纯文本
        return extractText(html);
    }
}

/**
 * 检测是否为纯文本（兼容旧评论）
 */
export function isPlainText(content: string): boolean {
    if (!content) return true;
    // 如果包含 HTML 标签，视为富文本
    const htmlRegex = /<[a-z][\s\S]*>/i;
    return !htmlRegex.test(content);
}

/**
 * 将纯文本转为 HTML（保留换行）
 */
export function plainTextToHtml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br />');
}

/**
 * 提取纯文本用于预览/长度校验
 */
export function extractText(html: string): string {
    if (!html) return '';

    if (typeof window === 'undefined') {
        // SSR 环境：正则提取
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .trim();
    }

    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').trim();
}

/**
 * 判断 HTML 中是否包含图片
 */
export function hasImage(html: string): boolean {
    if (!html) return false;
    return /<img\s+[^>]*src=["'][^"']+["']/i.test(html);
}

/**
 * 计算 HTML 的纯文本长度
 */
export function getTextLength(html: string): number {
    return extractText(html).length;
}

/**
 * 判断内容是否为空（纯文本为空且无图片）
 */
export function isContentEmpty(html: string): boolean {
    const text = extractText(html);
    return !text && !hasImage(html);
}

/**
 * 转义 HTML 特殊字符（用于代码块等场景）
 */
export function escapeHtml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * 去除 HTML 中的所有标签，只保留纯文本
 */
export function stripHtml(html: string): string {
    return extractText(html);
}

/**
 * 截断 HTML（保留标签完整性）
 *
 * @param html 原始 HTML
 * @param maxLength 最大纯文本长度
 * @param suffix 截断后添加的后缀
 */
export function truncateHtml(
    html: string,
    maxLength: number = 200,
    suffix: string = '...'
): string {
    const text = extractText(html);

    if (text.length <= maxLength) {
        return html;
    }

    // 简单截断纯文本
    return text.slice(0, maxLength) + suffix;
}

export function sanitizeCommentHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
            'a', 'img', 'code', 'pre', 'blockquote',
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style'],
    });
}