const { Op, QueryTypes } = require('sequelize');
const sequelize = require('../common/db');
const { Category } = require('../models');

async function getCategories(req, res, next) {
    try {
        const { page = 1, limit = 100, id, search } = req.query;
        const offset = (page - 1) * limit;
        let where = { [Op.and]: [] };

        where.status = 0;
        const platform = '1';
        where[Op.and].push(sequelize.where(sequelize.fn('FIND_IN_SET', platform, sequelize.col('platform')), { [Op.gt]: 0 }));
        if (id) where.id = id;
        if (search) {
            where[Op.and].push({
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { seoTitle: { [Op.like]: `%${search}%` } },
                    { seoKeywords: { [Op.like]: `%${search}%` } },
                    { seoDescription: { [Op.like]: `%${search}%` } }
                ]
            })
        }
        const { count, rows } = await Category.findAndCountAll({ where, limit, offset });

        res.json({ code: 1, message: 'Category retrieved successfully', count: count, data: rows });
    } catch (error) {
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}
async function getCategoryById(req, res, next) {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.json({ code: -1, message: 'Category not found' });
        }
        res.json({ code: 1, message: 'Category retrieved successfully', data: category });
    } catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}
async function getCategoryArticlePairs(req, res, next) {
    try {
        const sql = `SELECT JSON_ARRAYAGG(JSON_OBJECT('pinyin', c.pinyin,'id', a.id)) AS data FROM cms_category c INNER JOIN cms_article a ON a.cid = c.id`
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
    getCategories,
    getCategoryById,
    getCategoryArticlePairs
}