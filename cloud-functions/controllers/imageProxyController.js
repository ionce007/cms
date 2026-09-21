// controllers/imageProxyController.js
const axios = require('axios');
const ImageProxy = require('../common/image-proxy');

// ✅ 允许代理的图片服务器白名单
const ALLOWED_HOSTS = [
    'img.foryet.com',
    'localhost',
    '127.0.0.1',
    // 添加你的图片服务器域名
];
// 创建图片代理实例
const imageProxy = new ImageProxy({
    timeout: 15000,
    maxContentLength: 20 * 1024 * 1024, // 20MB
    allowedDomains: ALLOWED_HOSTS, //process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : null,
    deniedDomains: [],//process.env.DENIED_DOMAINS ? process.env.DENIED_DOMAINS.split(',') : []
});

// ✅ 允许的图片类型
const ALLOWED_TYPES = [
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
 * 图片代理
 * GET /api/proxy-image?url=http://img-server.com/xxx.jpg
 */
async function proxyImage(req, res, next) {
    try {
        const { url, format } = req.query;
        const { stream, headers } = await imageProxy.getImageStream(url);

        const contentType = headers['content-type'] || 'image/jpeg';
        const contentLength = headers['content-length'];
        const cacheControl = headers['cache-control'] || 'public, max-age=3600';

        res.set({
            'Content-Type': contentType,
            'Content-Length': contentLength,
            'Cache-Control': cacheControl,
            'ETag': headers['etag'] || '',
            'Last-Modified': headers['last-modified'] || '',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Image-Source': url,
            'X-Proxy-Server': 'Image-Proxy-API/1.0',
            'Cross-Origin-Resource-Policy': 'cross-origin'
        });

        // 如果请求了特定格式，可以在这里转换（需要sharp等库）
        if (format) {
            // 可以使用sharp库进行格式转换
            // const sharp = require('sharp');
            // stream.pipe(sharp().toFormat(format)).pipe(res);
            res.status(501).json({ error: 'Format conversion not implemented' });
            return;
        }

        // 将图片流传输到响应
        stream.pipe(res);

        // 错误处理
        stream.on('error', (error) => {
            console.error('Stream error:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to stream image' });
            }
        });

        // 响应结束处理
        res.on('finish', () => {
            console.log(`Successfully proxied image from: ${url}`);
        });

    } catch (error) {
        console.error('Proxy error:', error.message);

        const statusCode = error.message.includes('not allowed') ? 403 :
            error.message.includes('Invalid URL') ? 400 :
                error.message.includes('timeout') ? 504 :
                    error.message.includes('not found') ? 404 :
                        error.message.includes('responded with') ? parseInt(error.message.match(/\d+/)?.[0]) || 502 : 500;

        res.status(statusCode).json({
            error: error.message,
            url: req.query.url,
            timestamp: new Date().toISOString()
        });
    }
}

  async function imgProxy(req, res, next){
    try {
        const { url, format } = req.query;
        console.log('url = ', url, '     format = ', format);
        const { stream, headers } = await imageProxy.getImageStream(url);

        const contentType = headers['content-type'] || 'image/jpeg';
        const contentLength = headers['content-length'];
        const cacheControl = headers['cache-control'] || 'public, max-age=3600';

        res.set({
            'Content-Type': contentType,
            'Content-Length': contentLength,
            'Cache-Control': cacheControl,
            'ETag': headers['etag'] || '',
            'Last-Modified': headers['last-modified'] || '',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-Image-Source': url,
            'X-Proxy-Server': 'Image-Proxy-API/1.0',
            'Cross-Origin-Resource-Policy': 'cross-origin'
        });

        // 如果请求了特定格式，可以在这里转换（需要sharp等库）
        if (format) {
            // 可以使用sharp库进行格式转换
            // const sharp = require('sharp');
            // stream.pipe(sharp().toFormat(format)).pipe(res);
            res.status(501).json({ error: 'Format conversion not implemented' });
            return;
        }

        // 将图片流传输到响应
        stream.pipe(res);

        // 错误处理
        stream.on('error', (error) => {
            console.error('Stream error:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to stream image' });
            }
        });

        // 响应结束处理
        res.on('finish', () => {
            console.log(`Successfully proxied image from: ${url}`);
        });

    } catch (error) {
        console.error('Proxy error:', error.message);

        const statusCode = error.message.includes('not allowed') ? 403 :
            error.message.includes('Invalid URL') ? 400 :
                error.message.includes('timeout') ? 504 :
                    error.message.includes('not found') ? 404 :
                        error.message.includes('responded with') ? parseInt(error.message.match(/\d+/)?.[0]) || 502 : 500;

        res.status(statusCode).json({
            error: error.message,
            url: req.query.url,
            timestamp: new Date().toISOString()
        });
    }
}
module.exports = { proxyImage ,imgProxy};