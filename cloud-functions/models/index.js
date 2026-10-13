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
const PasswordReset = require('./PasswordReset')
const MemberBookmark = require('./MemberBookmark')
const MemberLike = require('./MemberLike')
const MemberDownload = require('./MemberDownload')

const sequelize = require('../common/db');
let isInitialized = false;
// 统一在此处定义所有关联
function initAssociations() {
    if (isInitialized) return;
    isInitialized = true;

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

    // ✅ 会员表建立关联
    PasswordReset.belongsTo(Member, { foreignKey: 'memberId' });
    Member.hasMany(PasswordReset, { foreignKey: 'memberId' });
    //Article.belongsToMany(Tag, { through: ArticleTag });
    //Tag.belongsToMany(Article, { through: ArticleTag });
};

async function initializeDatabase() {
    let result = { code: 0, message: 'Failed to initialize database.' };
    try {
        console.log('Database synchronization in progress, please wait......');
        //initAssociations();
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
exports.initAssociations = initAssociations;
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
exports.PasswordReset = PasswordReset;
exports.MemberBookmark = MemberBookmark;
exports.MemberLike = MemberLike;
exports.MemberDownload = MemberDownload;