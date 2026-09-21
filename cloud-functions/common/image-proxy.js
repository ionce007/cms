const axios = require('axios');
const { URL } = require('url');

class ImageProxy {
    constructor(options = {}) {
        this.timeout = options.timeout || 10000;
        this.maxContentLength = options.maxContentLength || 10 * 1024 * 1024; // 10MB
        this.allowedDomains = options.allowedDomains || null; // 白名单域名
        this.deniedDomains = options.deniedDomains || []; // 黑名单域名
        this.userAgent = options.userAgent || 'Mozilla/5.0 Image-Proxy/1.0';

        this.allowedDomains = Array.isArray(this.allowedDomains)
            ? this.allowedDomains.map((host) => host.toLowerCase())
            : this.allowedDomains;
        this.deniedDomains = Array.isArray(this.deniedDomains)
            ? this.deniedDomains.map((host) => host.toLowerCase())
            : [];

        this.axiosInstance = axios.create({
            timeout: this.timeout,
            maxContentLength: this.maxContentLength,
            headers: {
                'User-Agent': this.userAgent
            }
        });
    }

    // 验证 URL
    validateUrl(url) {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.toLowerCase();

            // 验证协议
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error('Only HTTP and HTTPS protocols are allowed');
            }

            // 检查黑名单
            if (this.deniedDomains.includes(hostname)) {
                throw new Error('Domain is not allowed');
            }

            // 允许生产图片域名 + 本地开发调试域名
            const localDebugHosts = ['localhost', '127.0.0.1'];
            const allowedHosts = Array.isArray(this.allowedDomains)
                ? this.allowedDomains
                : [];

            const isAllowed =
                allowedHosts.includes(hostname) ||
                localDebugHosts.includes(hostname) ||
                hostname.endsWith('.localhost');

            if (this.allowedDomains && !isAllowed) {
                throw new Error('Domain is not in the allowed list');
            }

            return parsedUrl;
        } catch (error) {
            if (error.code === 'ERR_INVALID_URL') {
                throw new Error('Invalid URL format');
            }
            throw error;
        }
    }

    // 获取图片流
    async getImageStream(imageUrl, options = {}) {
        const parsedUrl = this.validateUrl(imageUrl);

        const requestOptions = {
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
            timeout: options.timeout || this.timeout,
            headers: {
                'Referer': parsedUrl.origin,
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                ...options.headers
            }
        };

        try {
            const response = await this.axiosInstance(requestOptions);

            // 验证 Content-Type
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                response.data.destroy(); // 关闭流
                throw new Error('URL does not point to a valid image');
            }

            return {
                stream: response.data,
                headers: {
                    'content-type': contentType,
                    'content-length': response.headers['content-length'],
                    'last-modified': response.headers['last-modified'],
                    'etag': response.headers['etag'],
                    'cache-control': response.headers['cache-control'] || 'public, max-age=3600'
                },
                status: response.status,
                size: parseInt(response.headers['content-length']) || 0
            };
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout');
            } else if (error.code === 'ENOTFOUND') {
                throw new Error('Domain not found');
            } else if (error.response) {
                throw new Error(`Remote server responded with ${error.response.status}`);
            } else {
                throw new Error(`Failed to fetch image: ${error.message}`);
            }
        }
    }

    // 获取图片信息（不下载）
    async getImageInfo(imageUrl) {
        const parsedUrl = this.validateUrl(imageUrl);

        try {
            const response = await this.axiosInstance.head(imageUrl);

            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error('URL does not point to a valid image');
            }

            return {
                url: imageUrl,
                contentType: contentType,
                contentLength: response.headers['content-length'],
                lastModified: response.headers['last-modified'],
                etag: response.headers['etag'],
                accepted: true
            };
        } catch (error) {
            throw new Error(`Failed to get image info: ${error.message}`);
        }
    }
}

module.exports = ImageProxy;