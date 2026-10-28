
const ArticleController = require('./ArticleController');
const CategoryController = require('./CategoryController');
const TagController = require('./TagController');
const FragController = require('./FragController');
const SiteController = require('./SiteController');
const ImageController = require('./imageProxyController');
const BaiduAuthController = require('./baidu/AuthController')
const TokenController = require('./TokenController')
const FormulaController = require('./FormulaController')
const MemberController = require('./MemberController')
const CommentController = require('./CommentController')
const UploadController = require('./UploadController')
const VisitlogController = require('./VisitlogController');


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
    Comment: CommentController,
    Upload: UploadController,
    VisitLog: VisitlogController,
}