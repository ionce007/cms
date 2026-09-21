'use client';

const getSafeLocationHref = () => {
    if (typeof window !== 'undefined' && window.location) {
        return window.location.href;
    }

    if (typeof location !== 'undefined' && location && location.href) {
        return location.href;
    }

    if (typeof globalThis !== 'undefined' && globalThis.location) {
        return globalThis.location.href;
    }

    return '';
};
const baseUrl = 'http://localhost:8088';
export class ImageProxy {
    constructor(config = { refUrl: baseUrl }) {
        this.refUrl = '';
        this.proxyUrl = '';
        this.allowedDomains = ['img.foryet.com','localhost:8088', 'www.people.com.cn'];

        try {
            const refUrl = baseUrl;//config?.refUrl || getSafeLocationHref();
            if (!refUrl) return;

            const url = new URL(refUrl);
            this.refUrl = refUrl;
            this.proxyUrl = config?.proxyUrl || `${url.protocol}//${url.host}/api/imgproxy`;
            this.allowedDomains = config?.allowedDomains || this.allowedDomains;
        } catch (error) {
            console.warn('ImageProxy constructor error:', error);
        }
    }

    getProxyUrl(originalUrl) {
        try {
            if (!originalUrl) return originalUrl;
            if (originalUrl.startsWith('//')) originalUrl = 'http:' + originalUrl;
            const url = new URL(originalUrl);

            if (!this.refUrl) return originalUrl;
            const host = new URL(this.refUrl).hostname;

            if (url.protocol === 'https:' || url.hostname === host) {
                return originalUrl;
            }
console.log('url.hostname = ', url.hostname);
            if (!this.allowedDomains.includes(url.hostname)) {
                console.warn(`不支持的图片域名: ${url.hostname}`);
                return originalUrl;
            }
console.log('this.proxyUrl = ', this.proxyUrl)
            return `${this.proxyUrl}?url=${encodeURIComponent(originalUrl)}`;
        } catch (error) {
            console.error('URL解析错误:', error);
            return originalUrl;
        }
    }

    convertPageImages() {
        if (typeof document === 'undefined') return;
        if (!this.refUrl || this.refUrl === '') return;
        if (this.refUrl.startsWith('http://')) return;

        const imgs = document.querySelectorAll('img');
        const reloadCount = document.querySelectorAll("img[data-label='proxy']").length;
        if (reloadCount >= imgs.length) return;

        imgs.forEach((img) => {
            const src = img.getAttribute('src');
            if (!src) return;
            if (src.startsWith('http://') || src.startsWith('//img.foryet.com')) {
                img.setAttribute('data-original-src', src);
                img.setAttribute('data-label', 'proxy');
                img.src = this.getProxyUrl(src);
            }
        });
    }

    convertContainerImages(container) {
        if (typeof document === 'undefined' || !container || typeof container.querySelectorAll !== 'function') return;
        if (!this.refUrl || this.refUrl.startsWith('http://')) return;

        const imgs = container.querySelectorAll('img');
        const reloadCount = container.querySelectorAll("img[data-label='proxy']").length;
        if (reloadCount >= imgs.length) return;

        imgs.forEach((img) => {
            const src = img.getAttribute('src');
            if (!src) return;
            if (src.startsWith('http://') || src.startsWith('//img.foryet.com')) {
                img.setAttribute('data-original-src', src);
                img.setAttribute('data-label', 'proxy');
                img.src = this.getProxyUrl(src);
            }
        });
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            if (typeof Image === 'undefined') {
                reject(new Error('Image is not available in current runtime'));
                return;
            }

            const img = new Image();
            img.src = this.getProxyUrl(url);
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Image load failed: ${url}`));
        });
    }
}

export function initImageProxy(config = {}) {
    if (typeof window === 'undefined') {
        return null;
    }

    const instance = new ImageProxy({
        ...config,
        refUrl: config.refUrl || window.location.href,
    });

    instance.convertPageImages();
    return instance;
}

// Example usage:
// if (typeof window !== 'undefined') {
//   const imageProxy = initImageProxy();
// }