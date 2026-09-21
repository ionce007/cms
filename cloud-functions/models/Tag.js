const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Tag extends Model { }

Tag.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '标签ID，关键字串类型，自动递增',
        },
        name: { type: DataTypes.STRING(10), comment: '标签名称' },
        path: { type: DataTypes.STRING, comment: '标签路径,网页地址栏标识' },
        count: { type: DataTypes.INTEGER, comment: '标签使用次数' },
        /*articleCount:{
            type: DataTypes.VIRTUAL,
            comment: '标签下的文章数量',
            defaultValue: 0,
            get() {
                const count = this.getDataValue('articleCount');
                return count !== undefined && count !== null ? parseInt(articleCount) : 0;
            }
        }*/
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'cms_tag'  // 指定表名
    }
);

module.exports = Tag;