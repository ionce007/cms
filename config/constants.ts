// config/constants.ts
import { FormulaCategory, FormulaKind } from '@/types/download'
/**
 * 分页大小
 */
export const ITEMS_PER_PAGE = 6;
export const ARTICLES_PER_PAGE = 12;
export const TAGS_PER_PAGE = 20;

/**
 * SWR 缓存配置
 */
export const SWR_CONFIG = {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
};

/**
 * API 请求超时（毫秒）
 */
export const API_TIMEOUT = 10000;

/**
 * 图片缓存时间（秒）
 */
export const IMAGE_CACHE_MAX_AGE = 604800; // 7 天

/**
 * 支持的图片类型
 */
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/avif',
];

/**
 * localStorage Keys
 */
export const STORAGE_KEYS = {
    VIEW_MODE: 'articles-view-mode',
    THEME: 'theme',
    USER_TOKEN: 'user-token',
} as const;

/**
 * 排序选项
 */
export const SORT_OPTIONS = [
    { value: 'latest', label: '最新发布', icon: '🕐' },
    { value: 'oldest', label: '最早发布', icon: '📅' },
    { value: 'popular', label: '最多阅读', icon: '👁️' },
    { value: 'likes', label: '最多点赞', icon: '❤️' },
] as const;

// config/constants.ts

/**
 * 文件分类
 */
export const FORMULA_CATEGORIES: FormulaCategory[] = [
    { value: 0, label: '指标公式', icon: '📈' },
    { value: 1, label: '选股公式', icon: '🎯' },
    { value: 2, label: '副图指标', icon: '📊' },
    { value: 3, label: '主图指标', icon: '📉' },
    { value: 4, label: '其他', icon: '📁' },
];

/**
 * 文件类型
 */
export const FORMULA_KINDS: FormulaKind[] = [
    { value: 'zbgs', label: '指标公式', icon: '📈' },
    { value: 'xggs', label: '选股公式', icon: '🎯' },
    { value: 'zbt', label: '指标图', icon: '📊' },
    { value: 'other', label: '其他', icon: '📁' },
];

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 时间戳格式化
 */
export function formatTimestamp(timestamp: number | string): string {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    // 如果是秒级时间戳，转为毫秒
    const ms = ts < 10000000000 ? ts * 1000 : ts;
    return new Date(ms).toLocaleDateString('zh-CN');
}

export type SortOption = typeof SORT_OPTIONS[number]['value'];