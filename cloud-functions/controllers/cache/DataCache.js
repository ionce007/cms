const { Op } = require('sequelize');
import sequelize from '../../common/db.js';  // 导入 sequelize 实例
import { Category, Tag, Frag, Site } from '../../models'

async function getAllCategories() {
    try {

        // ✅ where 放在 findAll 的配置对象里
        const where = {
            status: 0,
            [Op.and]: [
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', '1', sequelize.col('platform')),
                    { [Op.gt]: 0 }
                )
            ]
        };
        const attributes = {
            exclude: [
                'seoTitle',
                'seoKeywords',
                'seoDescription',
                'orderBy',
                'listView',
                'articleView'
            ]
        }
        const data = await Category.findAll({ where, attributes, raw: true });
        return data;
    } catch (error) {
        console.log('getAllCategories error: ', error);
        return null;
    }
}
async function getAllTags() {
    try {
        const data = await Tag.findAll({ raw: true });
        return data;
    }
    catch (error) {
        console.log('getAllTags error: ', error);
        return null;
    }
}
async function getAllFrags() {
    try {
        const data = await Frag.findAll({ raw: true });
        return data;
    }
    catch (error) {
        console.log('getAllFrags error: ', error);
        return null;
    }
}
async function getSiteConfig() {
    try {
        const data = await Site.findOne({ raw: true });
        return data;
    }
    catch (error) {
        console.log('getSiteConfig error: ', error);
        return null;
    }
}
function filterByIds(data, ids, options = {}) {
    const { keepOrder = false } = options;

    if (!Array.isArray(data) || !ids) return [];

    // 解析 ids
    const idList = String(ids)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !Number.isNaN(n));

    if (idList.length === 0) return [];

    // 只保留 id、name、path
    const pick = ({ id, name, path }) => ({ id, name, path });

    if (keepOrder) {
        // 按 ids 顺序
        const map = new Map(data.map(item => [item.id, item]));
        return idList.map(id => map.get(id)).filter(Boolean).map(pick);
    }

    // 按 data 顺序
    const idSet = new Set(idList);
    return data.filter(item => idSet.has(item.id)).map(pick);
}
module.exports = {
    getAllCategories,
    getAllTags,
    getAllFrags,
    getSiteConfig,
    filterByIds
}