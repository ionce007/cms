// controllers/admin/MemberController.js
const { Member } = require('../../models');
const { Op } = require('sequelize');

// 获取会员列表
async function getMembers(req, res) {
    try {
        const { page = 1, limit = 10, keyword, status } = req.query;
        const where = {};

        if (keyword) {
            where[Op.or] = [
                { username: { [Op.like]: `%${keyword}%` } },
                { nickname: { [Op.like]: `%${keyword}%` } },
                { email: { [Op.like]: `%${keyword}%` } }
            ];
        }
        if (status !== undefined && status !== '') where.status = status;

        const { count, rows } = await Member.findAndCountAll({
            where,
            order: [['id', 'DESC']],
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            attributes: { exclude: ['password'] }
        });

        res.json({ code: 1, data: rows, total: count });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 更新会员状态（封禁/解封）
async function updateMemberStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const member = await Member.findByPk(id);
        if (!member) return res.json({ code: -1, message: '会员不存在' });

        await member.update({ status });
        res.json({ code: 1, message: '状态更新成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

// 删除会员
async function deleteMember(req, res) {
    try {
        const { id } = req.params;
        const member = await Member.findByPk(id);
        if (!member) return res.json({ code: -1, message: '会员不存在' });

        await member.destroy();
        res.json({ code: 1, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: -1, message: error.message });
    }
}

module.exports = {
    getMembers, updateMemberStatus, deleteMember
};