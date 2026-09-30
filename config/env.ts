// config/env.ts
/**
 * 是否开发环境
 */
export const IS_DEV = process.env.NODE_ENV === 'development';
//export const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * API 基础地址
 * 优先使用环境变量，其次使用稳定的线上默认地址，避免 edgeone makers dev / build
 * 直接访问不存在的本地后端导致 fetch ECONNREFUSED。
 */
const DEFAULT_API_BASE_URL = 'https://blog.foryet.com/api';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
/**
 * 站点基础地址（用于 SEO、OG）
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.foryet.com';


/**
 * 图片代理路径
 */
export const IMAGE_PROXY_PATH = `${API_BASE_URL}/imgproxy`;