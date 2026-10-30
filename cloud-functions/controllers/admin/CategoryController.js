// controllers/admin/CategoryController.js
const { Category, Article } = require('../../models');
const { fn, col } = require('sequelize');

async function list(req, res) {
    try {
        const rows = await Category.findAll({
            attributes: {
                include: [
                    [fn('COUNT', col('Articles.id')), 'count']
                ]
            },
            include: [{
                model: Article,
                as: 'Articles',
                attributes: [],
                required: false,
            }],
            group: ['id'], //col('cms_category.id')

            order: [['orderBy', 'ASC']],
            subQuery: false,
        });
        res.json({ code: 1, data: rows });
    } catch (error) {
        console.error('获取栏目失败:', error);
        res.status(500).json({ code: -1, message: error.message });
    }
}
// 创建
async function create(req, res) {
    try {
        const data = req.body;
        if (!data.name) return res.json({ code: -1, message: '栏目名称不能为空' });

        const category = await Category.create(data);
        res.json({ code: 1, message: '创建成功', data: category });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 更新
async function update(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;

        const category = await Category.findByPk(id);
        if (!category) return res.json({ code: -1, message: '栏目不存在' });

        await category.update(data);
        res.json({ code: 1, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 删除
async function remove(req, res) {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) return res.json({ code: -1, message: '栏目不存在' });

        await category.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = { list, create, update, remove };