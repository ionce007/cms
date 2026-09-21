const { Op } = require('sequelize');
import sequelize from '../common/db';  // 导入 sequelize 实例
const { Frag } = require('../models');

async function getFrags(req, res, next) {
    try {
        const { page = 1, limit = 100, id, search } = req.query;
        const offset = (page - 1) * limit;
        let where = {};

        if (id) where.id = id;
        if (search) {
        }
        const { count, rows } = await Frag.findAndCountAll({ where, limit, offset });

        res.json({ code: 1, message: 'Frag retrieved successfully', count: count, data: rows });
    } catch (error) {
        res.json({ code: -1, message: error.message, count: 0, data: [] });
    }
}

async function getFragById(req, res, next) {
    try {
        const { id } = req.params;
        const frag = await Frag.findByPk(id);
        if (!frag) {
            return res.json({ code: -1, message: 'Frag not found' });
        }
        res.json({ code: 1, message: 'Frag retrieved successfully', data: frag });
    } catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}
async function getFragByMark(req, res, next) {
    try {
        const { mark } = req.params;
        const frag = await Frag.findOne({ where: { mark } });
        if (!frag) {
            return res.json({ code: -1, message: 'Frag not found' });
        }
        res.json({ code: 1, message: 'Frag retrieved successfully', data: frag });
    } catch (error) {
        return res.status(404).json({ code: -1, message: error.message });
    }
}
module.exports = {
    getFrags,
    getFragById,
    getFragByMark
}