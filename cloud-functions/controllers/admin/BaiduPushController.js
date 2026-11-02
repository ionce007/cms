const { Op } = require('sequelize');
const { pushUrls, SITE } = require('../../services/baiduPush');
import { BaiduPushLog, Article, Formula } from '../../models';
//const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://cms.foryet.com';

async function baiduPush(req, res) {
    try {
        const { type, ids } = req.body;
        if (!ids || !ids.length) {
            return res.json({ code: -1, message: '请选择要提交的页面' });
        }
        if (ids.length > 2000) {
            return res.json({ code: -1, message: '单次提交不能超过 2000 条' });
        }

        // 根据类型查询对应记录（字段按你的模型实际情况调整，这里用 slug 和 title）
        let records;
        if (type === 'article') {
            records = await Article.findAll({
                where: { id: { [Op.in]: ids } },
                attributes: ['id', 'title'],
            });
        } else if (type === 'formula') {
            records = await Formula.findAll({
                where: { fs_id: ids },
                attributes: ['fs_id', 'server_filename']
            });
        } else {
            return res.json({ code: -1, message: '无效的类型' });
        }

        if (!records.length) {
            return res.json({ code: -1, message: '未找到对应记录' });
        }

        // 构建 URL 映射：url -> { id, title }
        const urlMap = {};
        const urls = records.map(r => {
            const path = type === 'article'
                ? `/articles/${r.id}`
                : `/downloads/${r.fs_id}`;
            const fullUrl = `${SITE}${path}`;
            urlMap[fullUrl] = { id: type === 'article' ? r.id : r.fs_id, title: type === 'article' ? r.title : r.server_filename };
            return fullUrl;
        });

        // 提交到百度
        const result = await pushUrls(urls);

        // 计算成功/失败的 URL
        const failedUrls = new Set([
            ...(result.data?.not_same_site || []),
            ...(result.data?.not_valid || [])
        ]);
        const successUrls = new Set(urls.filter(u => !failedUrls.has(u)));
        //const remain = result.remain || 0;
        //const successCount = result.success || 0;
        // 逐条写入日志
        const logRows = urls.map(url => ({
            title: urlMap[url].title,
            url,
            mark: type,
            targetId: urlMap[url].id, // 👈 这里新增 targetId
            status: successUrls.has(url) ? 1 : 2,
            result: JSON.stringify(result)
        }));
        await BaiduPushLog.bulkCreate(logRows);

        res.json({
            code: 1,
            message: `提交完成，成功 ${result.data.success || 0} 条，剩余配额 ${result.data.remain || 0}`,
            data: result
        });
    } catch (err) {
        console.error('Baidu Push Error:', err.message);
        res.status(500).json({ code: -1, message: '内部服务器错误' });
    }
}
async function getBaiduPushLogs(req, res) {
    try {
        const { type, keyword } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const where = {};
        if (req.query.type) where.mark = req.query.type;
        // 如果有搜索关键词，进行模糊匹配
        if (keyword) {
            where.title = { [Op.like]: `%${keyword}%` };
        }
        const { count, rows } = await BaiduPushLog.findAndCountAll({
            where,
            order: [['id', 'DESC']],
            offset: (page - 1) * limit,
            limit
        });
        res.json({ code: 1, data: rows, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}
/**
 * GET /admin/baidu-push/submitted-ids
 * query: type
 * 返回该类型下所有成功提交过的 ID（从 url 中解析）
 */
async function submittedIds(req, res) {
    try {
        const { type } = req.query;
        const logs = await BaiduPushLog.findAll({
            where: { mark: type, status: 1 },
            attributes: ['url', 'createdAt']
        });

        // 从 URL 中解析出 ID，并聚合次数与最后时间
        const map = {};
        logs.forEach(l => {
            const match = l.url.match(/\/(\d+)$/);
            if (!match) return;
            const id = parseInt(match[1]);
            if (!map[id]) map[id] = { id, count: 0, lastTime: null };
            map[id].count += 1;
            const t = l.createdAt ? new Date(l.createdAt).getTime() : 0;
            if (!map[id].lastTime || t > new Date(map[id].lastTime).getTime()) {
                map[id].lastTime = l.createdAt;
            }
        });

        res.json({ code: 1, data: Object.values(map) });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = { baiduPush, getBaiduPushLogs, submittedIds, };