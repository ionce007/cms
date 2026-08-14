const { DataTypes, Model } = require('sequelize');
const sequelize = require('../common/db');

class Site extends Model { }

Site.init(
    {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: 'ID，关键字串类型，自动递增',
        },
        name: { type: DataTypes.STRING(50), comment: '站点名称' },
        domain: { type: DataTypes.STRING(50), comment: '站点域名' },
        email: { type: DataTypes.STRING(100), comment: '站点邮箱' },
        wx: { type: DataTypes.STRING(50), comment: '站点备案号' },
        icp: { type: DataTypes.STRING(100), comment: 'ICP备案号' },     
        code: { type: DataTypes.STRING(1000), comment: '站点统计代码' },
        json: { type: DataTypes.TEXT('medium'), comment: '站点配置json' },
        title: { type: DataTypes.STRING(100), comment: '站点标题' },
        keywords: { type: DataTypes.STRING(1000), comment: '站点关键字' },
        description: { type: DataTypes.STRING(500), comment: '站点描述' }
    },
    {
        sequelize, 
        tableName: 'cms_site',  // 指定表名
        comment: '网站信息'  // 表注释
    }
);
module.exports = Site;