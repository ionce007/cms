import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export function formatDate(date: string): string {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return target.toLocaleDateString('zh-CN');
}

export function getInitials(name: string): string {
    return name.charAt(0).toUpperCase();
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        published: 'bg-success-50 text-success-600',
        draft: 'bg-warning-50 text-warning-600',
        archived: 'bg-gray-50 text-gray-600',
        active: 'bg-success-50 text-success-600',
        inactive: 'bg-gray-50 text-gray-600',
    };
    return colors[status] || colors.inactive;
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        published: '已发布',
        draft: '草稿',
        archived: '已归档',
    };
    return labels[status] || status;
}

/**
 * 判断字符串是否为网址，支持 http / https，支持二级/多级子域名 cms.foryet.com
 * @param str 输入字符串
 * @returns boolean
 */
export function isUrl(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    const s = str.trim();
    if (s.length === 0) return false;

    let urlStr = s;
    // 没有 http:// 也没有 https://，才补 https:// 仅用于解析校验
    if (!/^https?:\/\//i.test(s)) {
        urlStr = 'https://' + s;
    }

    try {
        const url = new URL(urlStr);

        // 允许 http: 或者 https: 协议
        const isValidProtocol = url.protocol === 'http:' || url.protocol === 'https:';
        // hostname 必须包含 . ，排除 localhost 这种无点主机名
        const hasDotInHost = url.hostname.includes('.');

        return isValidProtocol && hasDotInHost;
    } catch {
        return false;
    }
}

export async function getBaseUrl(headersList: Headers) {
    const host = headersList.get('host') || 'blog.foryet.com';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const url = new URL(`${protocol}://${host}/api`);
    return url.toString();
}

type ReadTimeOptions = {
    chineseSpeed?: number;
    englishSpeed?: number;
    imageSeconds?: number;
    codeLineSeconds?: number;
    includeImages?: boolean;
    includeCode?: boolean;
};

export function calcReadTime(htmlContent: string, options: ReadTimeOptions = {}) {
    const {
        chineseSpeed = 350,      // 中文阅读速度（字/分钟）
        englishSpeed = 225,      // 英文阅读速度（词/分钟）
        imageSeconds = 10,       // 每张图片阅读时间（秒）
        codeLineSeconds = 10,     // 每行代码阅读时间（秒）
        includeImages = true,    // 是否计算图片时间
        includeCode = true       // 是否计算代码时间
    } = options;

    if (!htmlContent) return 0;

    // 移除不需要的内容
    let text = htmlContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

    // 提取图片数量
    const imageCount = includeImages
        ? (text.match(/<img[^>]*>/gi) || []).length
        : 0;

    // 提取代码块
    let codeLines = 0;
    if (includeCode) {
        const codeBlocks = text.match(/<(pre|code)[^>]*>[\s\S]*?<\/\1>/gi) || [];
        codeBlocks.forEach(block => {
            const codeText = block
                .replace(/<[^>]*>/g, '')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
            codeLines += codeText.split('\n').length;
        });
    }

    // 移除所有 HTML 标签和实体
    text = text
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&[a-zA-Z]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // 统计中文字符
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

    // 统计英文单词
    const englishWords = (text.replace(/[\u4e00-\u9fa5]/g, ' ')
        .match(/[a-zA-Z0-9]+/g) || []).length;

    // 计算阅读时间
    const textMinutes = chineseChars / chineseSpeed + englishWords / englishSpeed;
    const imageMinutes = imageCount * imageSeconds / 60;
    const codeMinutes = codeLines * codeLineSeconds / 60;

    const totalMinutes = Math.ceil(textMinutes + imageMinutes + codeMinutes);

    return Math.max(1, totalMinutes);
}
