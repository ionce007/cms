// routes/logRoutes.js
//const express = require('express');
//const router = express.Router();
//const { UAParser } = require('ua-parser-js');
//const IP2Region = require('ip2region').create();
const VisitLog = require('../models/VisitLog');

// 获取真实 IP
function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.socket.remoteAddress || req.ip;
}

// 解析 IP 定位
function getIpLocation(ip) {
    try {
        const result = IP2Region.memorySearchSync(ip);
        if (!result || !result.region) return {};
        const parts = result.region.split('|');
        return {
            prov: parts[2] !== '0' ? parts[2] : '',
            city: parts[3] !== '0' ? parts[3] : '',
            isp: parts[4] !== '0' ? parts[4] : '',
        };
    } catch (err) {
        return {};
    }
}

// ✅ 接收页面访问日志的 API (供 Next.js Middleware 调用)
//router.post('/page-view', async (req, res) => {
async function createVisitLog(req, res, next) {
    console.log('aaaaaaaa ');
    console.log('req.headers = ',req.headers);
    try {
        // 注意：由于是 Next.js 服务端发来的请求，req.body 里已经包含了 Next.js 端拿到的信息
        // 后端这里做兜底处理
        const {
            pageUrl,
            memberId,
            memberName,
            userAgent,
            clientIp
        } = req.body;

        const ip = clientIp || getClientIp(req);
        const ua = '';//UAParser(userAgent || req.headers['user-agent']);
        const location = getIpLocation(ip);

        // 异步写入，防止阻塞 Next.js 的请求
        /*VisitLog.create({
            memberId: memberId || null,
            memberName: memberName || null,
            logType: 'PAGE_VIEW',
            page: pageUrl,
            ip,
            osName: ua.os.name || '未知',
            browser: ua.browser.name || '未知',
            device: ua.device.type || 'desktop',
            ...location,
        }).catch(err => console.error('日志入库失败:', err));
*/
        res.json({ code: 1, message: '记录成功' });
    } catch (error) {
        res.json({ code: -1, message: error.message });
    }
};

module.exports = {
    createVisitLog,
};