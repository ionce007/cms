// controllers/admin/ArticleController.js
const { Article, Category, Tag, ArticleTag } = require('../../models');
const { Op } = require('sequelize');

// 获取列表 (保持不变)
async function list(req, res) {
    try {
        const { page = 1, limit = 10, keyword = '' } = req.query;
        const where = {};
        if (keyword) where.title = { [Op.like]: `%${keyword}%` };

        const { count, rows } = await Article.findAndCountAll({
            where,
            include: [{ model: Category, as: 'Category', attributes: ['name'] }],
            order: [['id', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
        });
        res.json({ code: 1, data: rows, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 获取单篇详情（包含标签）
async function detail(req, res) {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id, {
            include: [{ model: Tag, as: 'Tags', attributes: ['id', 'name'] }]
        });
        if (!article) return res.json({ code: -1, message: '文章不存在' });

        res.json({ code: 1, data: article });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 创建（处理中间表）
async function create(req, res) {
    try {
        const { tagIds, ...articleData } = req.body;
        if (!articleData.title || !articleData.cid) return res.json({ code: -1, message: '标题和栏目不能为空' });

        const article = await Article.create(articleData);

        // ✅ 处理标签关联： Sequelize 会自动向 cms_articletag 插入记录
        if (tagIds && tagIds.length > 0) {
            const tags = await Tag.findAll({ where: { id: tagIds } });
            await article.setTags(tags);
        }

        res.json({ code: 1, message: '创建成功', data: article });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// ✅ 更新（处理中间表）
async function update(req, res) {
    try {
        const { id } = req.params;
        const { tagIds, ...articleData } = req.body;

        const article = await Article.findByPk(id);
        if (!article) return res.json({ code: -1, message: '文章不存在' });

        await article.update(articleData);

        // ✅ 处理标签关联：会先删除旧关联，再插入新关联
        /*if (tagIds) {
            const tags = await Tag.findAll({ where: { id: tagIds } });
            await article.setTags(tags);
        }*/

        // ✅ 确保 tagIds 是数字数组，且非空
        if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
            const ids = tagIds.map((id) => Number(id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                const tags = await Tag.findAll({ where: { id: ids } });
                console.log('准备关联的 tags:', tags.map(t => t.id));
                await article.setTags(tags);
            }
        }

        res.json({ code: 1, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 删除（中间表记录会被级联删除或由 Sequelize 处理）
async function remove(req, res) {
    try {
        const { id } = req.params;
        const article = await Article.findByPk(id);
        if (!article) return res.json({ code: -1, message: '文章不存在' });

        // 先清除标签关联，再删文章（安全起见）
        await article.setTags([]);
        await article.destroy();

        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = { list, detail, create, update, remove };