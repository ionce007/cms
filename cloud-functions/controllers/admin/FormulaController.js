// controllers/admin/FormulaController.js
const { Formula, Token } = require('../../models');
const { Op } = require('sequelize');

// ✅ 1. 获取列表：仅查询 isdir = 0 的文件
async function list(req, res) {
    try {
        const { page = 1, limit = 10, keyword = '' } = req.query;
        const where = { isdir: 0 }; // 过滤目录
        if (keyword) where.server_filename = { [Op.like]: `%${keyword}%` };

        const { count, rows } = await Formula.findAndCountAll({
            where,
            order: [['fs_id', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
        });
        res.json({ code: 1, data: rows, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 2. 新增：获取百度网盘 Token 授权信息
async function getToken(req, res) {
    try {
        // 假设 supplier 为 'baidupan'
        const token = await Token.findOne({ where: { supplier: 'baidupan' } });
        if (!token) return res.json({ code: -1, message: '未找到授权信息' });

        res.json({ code: 1, data: token });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 获取详情
async function detail(req, res) {
    try {
        const { fs_id } = req.params;
        const formula = await Formula.findByPk(fs_id);
        if (!formula) return res.json({ code: -1, message: '公式不存在' });

        res.json({ code: 1, data: formula });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 更新
async function update(req, res) {
    try {
        const { fs_id } = req.params;
        // 只允许更新以下字段，防止前端覆盖只读属性
        const { category, server_filename, isSell, price, img, summary, content, status, kind } = req.body;

        const formula = await Formula.findByPk(fs_id);
        if (!formula) return res.json({ code: -1, message: '公式不存在' });

        await formula.update({
            category,
            server_filename,
            isSell,
            price,
            img,
            summary,
            content,
            status,
            kind,
            lastupdate: new Date() // 顺便更新修改时间
        });

        res.json({ code: 1, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 删除
async function remove(req, res) {
    try {
        const { id } = req.params;
        const formula = await Formula.findByPk(id);
        if (!formula) return res.json({ code: -1, message: '公式不存在' });

        await formula.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = { list, detail, update, remove, getToken };