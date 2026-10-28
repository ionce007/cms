// controllers/admin/FragController.js
const { Frag } = require('../../models');

// 获取列表
async function list(req, res) {
    try {
        const rows = await Frag.findAll({ order: [['id', 'ASC']] });
        res.json({ code: 1, data: rows });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 新增：创建碎片
async function create(req, res) {
    try {
        const { name, mark, content, type = 1 } = req.body;
        if (!name || !mark) return res.json({ code: -1, message: '名称和标识不能为空' });

        // 检查标识是否重复
        const exist = await Frag.findOne({ where: { mark } });
        if (exist) return res.json({ code: -1, message: '该碎片标识已存在' });

        const frag = await Frag.create({ name, mark, content, type }, {
            fields: ['name', 'mark', 'content', 'type']
        });
        res.json({ code: 1, message: '创建成功', data: frag });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 更新
async function update(req, res) {
    try {
        const { id } = req.params;
        const { name, mark, content } = req.body;

        const frag = await Frag.findByPk(id);
        if (!frag) return res.json({ code: -1, message: '碎片不存在' });

        // 如果修改了标识，需要检查是否重复
        if (mark && mark !== frag.mark) {
            const exist = await Frag.findOne({ where: { mark } });
            if (exist) return res.json({ code: -1, message: '该碎片标识已存在' });
        }

        await frag.update({ name, mark, content });
        res.json({ code: 1, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 新增：删除碎片
async function remove(req, res) {
    try {
        const { id } = req.params;
        const frag = await Frag.findByPk(id);
        if (!frag) return res.json({ code: -1, message: '碎片不存在' });

        await frag.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = { list, create, update, remove };