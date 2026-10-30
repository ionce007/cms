// routes/admin/dashboard.js
const express = require('express');
const { initAssociations } = require('../../models');
const { requireAdmin } = require('../../middleware/adminAuth');
const { checkPermission } = require('../../middleware/checkPermission');
const controllers = require('../../controllers/admin');

const env = require('dotenv')
env.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initAssociations();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 添加日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 添加根路由处理
app.get("/", (req, res) => {
    res.json({ message: "Hello from Express on Cloud Functions!" });
});

app.get('/test', async (req, res, next) => {
    res.json({ code: 1, message: '后台API测试！' });
})

// 仪表盘
// 获取仪表盘基础数据
app.get('/dashboard/stats', controllers.Dashboard.stats);
// 获取近 7 天访问趋势（用于迷你趋势图）
app.get('/dashboard/visit-trend', controllers.Dashboard.visitTrend);
app.get('/dashboard/baidu-pv-trend', requireAdmin, controllers.Dashboard.getBaiduPvTrend);

app.post('/login', controllers.Auth.login);

//app.use(requireAdmin);
app.get('/profile', requireAdmin, controllers.Auth.profile);
app.get('/logout', requireAdmin, controllers.Auth.logout);

// 栏目管理
app.get('/categories', requireAdmin, checkPermission('categories', 'view'), controllers.Category.list);
app.post('/categories', requireAdmin, checkPermission('categories', 'create'), controllers.Category.create);
app.put('/categories/:id', requireAdmin, checkPermission('categories', 'edit'), controllers.Category.update);
app.delete('/categories/:id', requireAdmin, checkPermission('categories', 'delete'), controllers.Category.remove);

// 标签管理
app.get('/tags', requireAdmin, checkPermission('tags', 'view'), controllers.Tag.list);
app.post('/tags', requireAdmin, checkPermission('tags', 'create'), controllers.Tag.create);
app.put('/tags/:id', requireAdmin, checkPermission('tags', 'edit'), controllers.Tag.update);
app.delete('/tags/:id', requireAdmin, checkPermission('tags', 'delete'), controllers.Tag.remove);

// ... 文章管理
app.get('/articles', requireAdmin, checkPermission('articles', 'view'), controllers.Article.list);
app.get('/articles/:id', requireAdmin, checkPermission('articles', 'edit'), controllers.Article.detail);
app.post('/articles', requireAdmin, checkPermission('articles', 'create'), controllers.Article.create);
app.put('/articles/:id', requireAdmin, checkPermission('articles', 'edit'), controllers.Article.update);
app.delete('/articles/:id', requireAdmin, checkPermission('articles', 'delete'), controllers.Article.remove);
app.get('/qiniu/token', requireAdmin, controllers.Upload.getQiniuToken);

// ... 下载公式
app.get('/formulas', requireAdmin, checkPermission('formulas', 'view'), controllers.Formula.list);
app.get('/formulas/:fs_id', requireAdmin, checkPermission('formulas', 'edit'), controllers.Formula.detail); // ✅ 新增
app.put('/formulas/:fs_id', requireAdmin, checkPermission('formulas', 'edit'), controllers.Formula.update); // ✅ 修改参数名为 fs_id
app.delete('/formulas/:id', requireAdmin, checkPermission('formulas', 'delete'), controllers.Formula.remove);

app.get('/bdpan/auth/token', requireAdmin, checkPermission('bdpan', 'view'), controllers.Token.getPanToken); // 获取网盘授权授权信息
app.get('/bdpan/auth/url', requireAdmin, checkPermission('bdpan', 'edit'), controllers.Token.getPanAuthUrl); // 获取网盘授权链接
app.post('/bdpan/auth', requireAdmin, checkPermission('bdpan', 'edit'), controllers.Token.getPanAuthCode);  // 通过code换取网盘access token
app.post('/bdpan/sync', requireAdmin, checkPermission('formulas', 'sync'), controllers.Token.syncFromPan);  // 同步网盘上的文件
app.get('/bdtongji/auth/token', requireAdmin, checkPermission('tongji', 'view'), controllers.Token.getTongjiToken); // 获取百度授权授权信息
app.get('/bdtongji/auth/url', requireAdmin, checkPermission('tongji', 'edit'), controllers.Token.getTongjiAuthUrl); // 获取百度统计授权链接
app.post('/bdtongji/auth', requireAdmin, checkPermission('tongji', 'edit'), controllers.Token.getTongjiAuthCode);  // 通过code换取统计access token

// 碎片信息
app.get('/frags', requireAdmin, checkPermission('frags', 'view'), controllers.Frag.list);
app.post('/frags', requireAdmin, checkPermission('frags', 'create'), controllers.Frag.create); // ✅ 新增
app.put('/frags/:id', requireAdmin, checkPermission('frags', 'edit'), controllers.Frag.update);
app.delete('/frags/:id', requireAdmin, checkPermission('frags', 'delete'), controllers.Frag.remove); // ✅ 新增

// ... 互动管理
// 评论
app.get('/interactions/comments', requireAdmin, checkPermission('comments', 'view'), controllers.Interaction.getComments);
app.put('/interactions/comments/:id/status', requireAdmin, checkPermission('comments', 'audit'), controllers.Interaction.updateCommentStatus);
app.delete('/interactions/comments/:id', requireAdmin, checkPermission('comments', 'delete'), controllers.Interaction.deleteComment);

// 点赞
app.get('/interactions/likes', requireAdmin, checkPermission('likes', 'view'), controllers.Interaction.getLikes);
app.delete('/interactions/likes/:id', requireAdmin, checkPermission('likes', 'delete'), controllers.Interaction.deleteLike);

// 收藏
app.get('/interactions/bookmarks', requireAdmin, checkPermission('bookmarks', 'view'), controllers.Interaction.getBookmarks);
app.delete('/interactions/bookmarks/:id', requireAdmin, checkPermission('bookmarks', 'delete'), controllers.Interaction.deleteBookmark);

// ✅ 下载
app.get('/interactions/downloads', requireAdmin, checkPermission('downloads', 'view'), controllers.Interaction.getDownloads);
app.delete('/interactions/downloads/:id', requireAdmin, checkPermission('downloads', 'delete'), controllers.Interaction.deleteDownload);

// ==================== 前台会员 ====================
app.get('/members', requireAdmin, checkPermission('members', 'view'), controllers.Member.getMembers);
app.put('/members/:id/status', requireAdmin, checkPermission('members', 'edit'), controllers.Member.updateMemberStatus);
app.delete('/members/:id', requireAdmin, checkPermission('members', 'delete'), controllers.Member.deleteMember);

// ==================== 系统用户与角色 ====================
// 角色
app.get('/system/roles', requireAdmin, checkPermission('roles', 'view'), controllers.User.getRoles);
app.post('/system/roles', requireAdmin, checkPermission('roles', 'create'), controllers.User.createRole);
app.put('/system/roles/:id', requireAdmin, checkPermission('roles', 'edit'), controllers.User.updateRole);
app.delete('/system/roles/:id', requireAdmin, checkPermission('roles', 'delete'), controllers.User.deleteRole);

// 系统用户
app.get('/system/users', requireAdmin, checkPermission('users', 'view'), controllers.User.getUsers);
app.post('/system/users', requireAdmin, checkPermission('users', 'create'), controllers.User.createUser);
app.put('/system/users/:id', requireAdmin, checkPermission('users', 'edit'), controllers.User.updateUser);
app.delete('/system/users/:id', requireAdmin, checkPermission('users', 'delete'), controllers.User.deleteUser);

// ... 系统设置
app.get('/settings/config', requireAdmin, checkPermission('settings', 'view'), controllers.Setting.getConfig);
app.put('/settings/config', requireAdmin, checkPermission('settings', 'edit'), controllers.Setting.updateConfig);

app.get('/settings/site', requireAdmin, checkPermission('settings', 'view'), controllers.Setting.getSite);
app.put('/settings/site', requireAdmin, checkPermission('settings', 'edit'), controllers.Setting.updateSite);

//全局搜索
app.get('/search', requireAdmin, controllers.Dashboard.globalSearch);

export default app;