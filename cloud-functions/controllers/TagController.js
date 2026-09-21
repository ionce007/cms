const { Op, QueryTypes } = require('sequelize');
import sequelize from '../common/db';  // 导入 sequelize 实例
const { Tag } = require('../models');

/*async function getTags(req, res, next) {
    try {
        const { page = 1, limit = 100, id, search } = req.query;
        const offset = (page - 1) * limit;
        let where = {};

        if (id) where.id = id;
        if (search) {
        }
        const { count, rows } = await Tag.findAndCountAll({ where, limit, offset });

        res.json({ code: 1, message: 'Tag retrieved successfully', count: count, data: rows });
    } catch (error) {
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}*/
async function getTags(req, res, next) {
    try {
        const { page = 1, limit = 100, id, search } = req.query;
        const offset = (page - 1) * limit;
        let where = {};

        if (id) where.id = id;
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const { count, rows } = await Tag.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: {
                include: [
                    // ✅ 子查询统计每个标签下的文章数
                    [
                        sequelize.literal(`(SELECT COUNT(*) FROM cms_article AS a WHERE FIND_IN_SET(Tag.id, a.tagId) > 0 )`),
                        'articleCount'
                    ]
                ]
            },
            order: [['id', 'ASC']],
        });

        res.json({ code: 1, message: 'Tag retrieved successfully', count, data: rows });
    } catch (error) {
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function getTagById(req, res, next) {
    try {
        const { id } = req.params;
        const tag = await Tag.findByPk(id);
        if (!tag) {
            return res.json({ code: -1, message: 'Tag not found' });
        }
        res.json({ code: 1, message: 'Tag retrieved successfully', data: tag });
    } catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}
async function getTagArticlePairs(req, res, next) {
    try {
        const sql = `SELECT JSON_ARRAYAGG(JSON_OBJECT('path', t.path, 'id', a.id)) AS data FROM cms_tag t  INNER JOIN cms_article a ON FIND_IN_SET(t.id, a.tagId) > 0`
        const result = await sequelize.query(sql, { type: QueryTypes.SELECT, raw: true });

        // result[0].data 是 JSON 数组
        const data = result[0].data || [];

        res.json({ code: 1, message: 'Success', data: data });
    } catch (error) {
        console.error('Error:', error);
        res.json({ code: -1, message: error.message, data: [] });
    }
}
module.exports = {
    getTags,
    getTagById,
    getTagArticlePairs
}