// controllers/admin/TagController.js
const { Tag } = require('../../models');

async function list(req, res) {
    try {
        const rows = await Tag.findAll({ order: [['id', 'DESC']] });
        res.json({ code: 1, data: rows });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function create(req, res) {
    try {
        const { name, path } = req.body;
        if (!name) return res.json({ code: -1, message: '标签名称不能为空' });

        const tag = await Tag.create({ name, path, count: 0 }, {
            fields: ['name', 'path', 'count']
        });
        res.json({ code: 1, message: '创建成功', data: tag });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { name, path } = req.body;

        const tag = await Tag.findByPk(id);
        if (!tag) return res.json({ code: -1, message: '标签不存在' });

        await tag.update({ name, path });
        res.json({ code: 1, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const tag = await Tag.findByPk(id);
        if (!tag) return res.json({ code: -1, message: '标签不存在' });

        await tag.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = { list, create, update, remove };