
const ArticleController = require('./ArticleController');
const CategoryController = require('./CategoryController');
const TagController = require('./TagController');
const FragController = require('./FragController');
const SiteController = require('./SiteController');
const ImageController = require('./imageProxyController');
const BaiduAuthController = require('./baidu/AuthController')
const TokenController = require('./TokenControllers')
const FormulaController = require('./FormulaController')
const MemberController = require('./MemberController')
//exports.Article = ArticleController;

module.exports = {
    Article: ArticleController,
    Category: CategoryController,
    Tag: TagController,
    Frag: FragController,
    Site: SiteController,
    Image: ImageController,
    BaibuAuth: BaiduAuthController,
    BaiduToken: TokenController,
    Formula: FormulaController,
    Member: MemberController,
}