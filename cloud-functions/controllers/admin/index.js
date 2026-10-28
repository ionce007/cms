const DashboardController = require('./DashboardController');
const LoginController = require('./LoginController');
const CategoryController = require('./CategoryController');
const TagController = require('./TagController');
const ArticleController = require('./ArticleController');
const UploadController = require('./UploadController');
const FormulaController = require('./FormulaController');
const FragController = require('./FragController');
const TokenController = require('./TokenController');
const InteractionController = require('./InteractionController');
const UserController = require('../../controllers/admin/UserController');
const MemberController = require('../../controllers/admin/MemberController');
const SettingController = require('../../controllers/admin/SettingController');

module.exports = {
    Dashboard: DashboardController,
    Auth: LoginController,
    Category: CategoryController,
    Tag: TagController,
    Article: ArticleController,
    Upload: UploadController,
    Formula: FormulaController,
    Frag: FragController,
    Token: TokenController,
    Interaction: InteractionController,
    User: UserController,
    Member: MemberController,
    Setting:SettingController,
}