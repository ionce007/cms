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