const { Site } = require('../models');

async function getSiteInfo(req, res, next) {
    try {
        const siteInfo = await Site.findOne();
        if (!siteInfo) {
            return res.json({ code: -1, message: 'Site information not found' });
        }

        // 兼容两种存储：JSON 字段（已是对象）或 STRING/TEXT（需反序列化）
        let json = siteInfo.json;
        if (typeof json === 'string') {
            try {
                json = JSON.parse(json);
            } catch (e) {
                json = {};
            }
        }
        if (!json || typeof json !== 'object') {
            json = {};
        }
        if (!json.logo) {
            json.logo = '/default-logo.png';
        }

        // 写回响应（避免直接改 Sequelize 实例字段造成脏数据标记）
        const data = siteInfo.toJSON ? siteInfo.toJSON() : { ...siteInfo };
        data.json = json;

        res.json({ code: 1, message: 'Site information retrieved successfully', data });
    } catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}

module.exports = {
    getSiteInfo
}