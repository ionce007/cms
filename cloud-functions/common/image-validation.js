//const rateLimit = require('express-rate-limit');

// 请求频率限制
/*const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100次请求
  message: {
    error: 'Too many requests, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});
*/
// URL 参数验证
const validateImageUrl = (req, res, next) => {
    const { url } = req.query;
console.log('url = ',url);
    if (!url) {
        return res.status(400).json({
            error: 'Missing required parameter: url',
            example: '/api/imgproxy?url=https://example.com/image.jpg'
        });
    }

    // 基本的 URL 格式验证
    try {
        new URL(url);
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Invalid URL format',
            details: 'Please provide a valid HTTP/HTTPS URL'
        });
    }
};

// 图片格式过滤
const validateImageFormat = (allowedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp']) => {
    return (req, res, next) => {
        const format = req.query.format;

        if (format && !allowedFormats.includes(format.toLowerCase())) {
            return res.status(400).json({
                error: 'Unsupported image format',
                allowed: allowedFormats
            });
        }

        next();
    };
};

module.exports = {
    //limiter,
    validateImageUrl,
    validateImageFormat
};