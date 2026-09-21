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
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const url = new URL(`${protocol}://${host}/api`);
    return url.toString();
}