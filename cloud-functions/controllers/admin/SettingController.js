// controllers/admin/SettingController.js
const { Config, Site } = require('../../models');

// ==================== 网站配置 (Config) ====================

// 获取网站配置
async function getConfig(req, res) {
    try {
        // 查找第一条记录，如果没有则创建默认数据
        const [config] = await Config.findOrCreate({
            where: { id: 1 },
            defaults: {
                template: 'default',
                uploadWay: '2', // 默认七牛云
            }
        });
        res.json({ code: 1, data: config });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 更新网站配置
async function updateConfig(req, res) {
    try {
        const data = req.body;
        const config = await Config.findByPk(1);
        if (!config) return res.json({ code: -1, message: '配置不存在' });

        await config.update(data);
        res.json({ code: 1, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ==================== 网站信息 (Site) ====================

// 获取网站信息
async function getSite(req, res) {
    try {
        const [site] = await Site.findOrCreate({
            where: { id: 1 },
            defaults: {
                name: '我的网站',
                domain: 'localhost',
            }
        });
        res.json({ code: 1, data: site });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 更新网站信息
async function updateSite(req, res) {
    try {
        const data = req.body;
        const site = await Site.findByPk(1);
        if (!site) return res.json({ code: -1, message: '信息不存在' });

        await site.update(data);
        res.json({ code: 1, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = {
    getConfig, updateConfig,
    getSite, updateSite
};