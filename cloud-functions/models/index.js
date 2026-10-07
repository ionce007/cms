const Category = require('./Category');
const Article = require('./Article');
const ArticleTag = require('./ArticleTag');
const Cmodel = require('./Cmodel');
const Role = require('./Role');
const User = require('./User');
const Config = require('./Config');
const Tag = require('./Tag');
const Field = require('./Field');
const Frag = require('./Frag');
const FriendLink = require('./Friendlink');
const LoginLog = require('./Loginlog');
const Message = require('./Message');
const Site = require('./Site');
const Slide = require('./Slide');
const Formula = require('./Formula');
const Token = require('./Token');
const Member = require('./Member')
const PwdReset = require('./PasswordReset')
const MemberBookmark = require('./MemberBookmark')
const sequelize = require('../common/db');

// 统一在此处定义所有关联
const defineAssociations = () => {
    Article.belongsToMany(Tag, {
        through: ArticleTag,
        foreignKey: 'aid',
        otherKey: 'tid',
        as: 'Tags'
    });

    Tag.belongsToMany(Article, {
        through: ArticleTag,
        foreignKey: 'tid',
        otherKey: 'aid',
        as: 'Articles'
    });

    Article.belongsTo(Category, {
        foreignKey: 'cid',
        as: 'Category'
    });
    
    //Article.belongsToMany(Tag, { through: ArticleTag });
    //Tag.belongsToMany(Article, { through: ArticleTag });
};

async function initializeDatabase() {
    let result = { code: 0, message: 'Failed to initialize database.' };
    try {
        console.log('Database synchronization in progress, please wait......');
        await sequelize.sync({ alter: true });
        //await sequelize.sync();
        console.log('Database configured.');
        result = { code: 1, message: 'Database initialized successfully.' };
    }
    catch (error) {
        console.error('Error initializing database:', error);
        result = { code: 0, message: 'Failed to initialize database.' };
    }
    finally {
        return result;
    }
}

exports.initializeDatabase = initializeDatabase;
exports.defineAssociations = defineAssociations;
exports.Category = Category;
exports.Article = Article;
exports.ArticleTag = ArticleTag;
exports.Cmodel = Cmodel;
exports.User = User;
exports.Role = Role;
exports.Config = Config;
exports.Tag = Tag;
exports.Field = Field;
exports.Frag = Frag;
exports.FriendLink = FriendLink;
exports.LoginLog = LoginLog;
exports.Message = Message;
exports.Site = Site;
exports.Slide = Slide;
exports.Formula = Formula;
exports.Token = Token;
exports.Member = Member;
exports.PwdReset = PwdReset;
exports.MemberBookmark = MemberBookmark;