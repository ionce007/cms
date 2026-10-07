const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');
const Sequelize = require('sequelize');
const { FORMULA_KIND, FORMULA_CATEGORY } = require('../common/constant');

class Formula extends Model { }

Formula.init(
    {
        fs_id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            primaryKey: true,
            comment: '指标公式编号，该字段从百度网盘获取',
        },
        path: { type: DataTypes.STRING, defaultValue: '', comment: '指标公式在网盘上的路径，包含文件名称' },
        server_filename: { type: DataTypes.STRING, defaultValue: '', comment: '指标公式文件名称' },
        size: { type: DataTypes.INTEGER, defaultValue: 0, comment: '文件大小' },
        server_mtime: { type: DataTypes.INTEGER, defaultValue: Sequelize.NOW, comment: '指标公式上传到网盘后的修改时间' },
        server_ctime: { type: DataTypes.INTEGER, defaultValue: Sequelize.NOW, comment: '指标公式上传到网盘的时间' },
        local_mtime: { type: DataTypes.INTEGER, defaultValue: Sequelize.NOW, comment: '指标公式本地的修改时间' },
        local_ctime: { type: DataTypes.INTEGER, defaultValue: Sequelize.NOW, comment: '指标公式本地的创建时间' },
        isdir: { type: DataTypes.INTEGER, defaultValue: 0, comment: '是否为目录，0-文件  1-目录' },
        category: { type: DataTypes.INTEGER, defaultValue: FORMULA_CATEGORY.OTHERS, comment: '文件类型' },
        md5: { type: DataTypes.STRING, defaultValue: "", comment: '文件MD5校验码' },
        dir_empty: { type: DataTypes.INTEGER, defaultValue: 0, comment: '目录是否为空' },
        price: { type: DataTypes.REAL, defaultValue: 0, comment: '指标公式售价' },
        isSell: { type: DataTypes.INTEGER, defaultValue: 1, comment: '指标公式是否可售' },
        xhsUrl: { type: DataTypes.STRING, defaultValue: "", comment: '是否有小红书网址' },
        img: { type: DataTypes.STRING, defaultValue: '', comment: '文件封面' },
        kind: { type: DataTypes.STRING, defaultValue: FORMULA_KIND.ZBGS, comment: '文件各类' },
        summary: { type: DataTypes.STRING(500), defaultValue: '', comment: '内容概述' },
        content: { type: DataTypes.TEXT, defaultValue: '', comment: '指标公式操作说明' },
        views: { type: DataTypes.INTEGER, defaultValue: 0, comment: '浏览次数' },
        likes: { type: DataTypes.INTEGER, defaultValue: 0, comment: '喜欢次数' },
        downloads: { type: DataTypes.INTEGER, defaultValue: 0, comment: '下载次数' },
        marked: { type: DataTypes.INTEGER, comment: '“收藏”的点击数量' },
        status: { type: DataTypes.INTEGER, defaultValue: 0, comment: '状态，1-显示 0-隐藏' },
        author: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: { name: '缠说・股经', avatar: '/img/avatar.jpg' },
            get() {
                return { name: '缠说・股经', avatar: '/img/avatar.jpg' };
                //const rawValue = this.getDataValue('settings');
                //return rawValue ? JSON.parse(rawValue) : { name: '缠说・股经', avatar: '/img/avatar.jpg' };
            },
            comment: '作者'
        },
        createtime: { type: DataTypes.DATE, defaultValue: Sequelize.NOW, comment: '同步入库时间' },
        lastupdate: { type: DataTypes.DATE, defaultValue: Sequelize.NOW, comment: '同步修改时间' }
    },
    {
        sequelize,
        tableName: 'cms_formula',  // 指定表名
        timestamps: false,
        comment: '百度网盘文件同步表'  // 表注释
    }
);

module.exports = Formula;
