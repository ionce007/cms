// services/baiduPush.js
const request = require('sync-request');

const BAIDU_API = 'http://data.zz.baidu.com/urls';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://cms.foryet.com';
const TOKEN = process.env.BDZZ_TOKEN || 'Jzd5ZPdQVD1IFSzh';

/**
 * 批量提交 URL 到百度资源平台
 * @param {string[]} urls 完整 URL 数组，单次不超过 2000 条
 * @returns {Promise<object>} 百度返回的原始结果
 */
async function pushUrls(urls) {
    if (!urls.length) {
        return { success: 0, remain: 0, not_same_site: [], not_valid: [] };
    }

    const body = urls.join('\n');
    try {
        const reqUrl = `${BAIDU_API}?site=${SITE}&token=${TOKEN}`;
        const header = { 'Content-Type': 'text/plain', 'Host': 'data.zz.baidu.com' };
        const res = request("POST", reqUrl, { body, headers: header });
        const result = JSON.parse(res.getBody('utf8'));// await res.json();
        console.log('Baidu Push Result:', result);
        return { code: 1, status: 200, msg: 'ok', data: result };
    } catch (err) {
        console.error('Baidu Push Error:', err.message);
        // 百度返回 4xx/5xx 时，响应体里通常也包含错误详情
        return { code: -1, status: 400, msg: err.message, data: null };
    }
}

module.exports = { pushUrls, SITE };