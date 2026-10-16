import mysql2 from 'mysql2';
import { Sequelize } from 'sequelize';
import express from "express";

const { initializeDatabase, initAssociations } = require('../models');
const controllers = require('../controllers');
const { validateImageUrl, validateImageFormat } = require('../common/image-validation');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const env = require('dotenv')
env.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import app from "../index.js"; // 导入 index.js 中的 Express 应用
//defineAssociations();

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

initAssociations();

app.get("/sync-db", async (req, res) => {
    //defineAssociations();
    const ret = await initializeDatabase();
    res.json(ret);
});

//app.get('/proxyimg', controllers.Image.proxyImage);
app.get("/imgproxy", validateImageUrl, validateImageFormat(), controllers.Image.imgProxy);// validateImageUrl, validateImageFormat(), controllers.Image.imgProxy);

app.get('/test', controllers.Article.test);
app.get('/articles', controllers.Article.getArticles);
app.post('/articles/search', optionalAuth, controllers.Article.searchArticles);
app.post('/articles/search-test', controllers.Article.searchArticlesTest);
app.get('/articles/pinned', optionalAuth, controllers.Article.getPinnedArticles);
app.get('/articles/recent', optionalAuth, controllers.Article.getRecentArticles);
app.get('/articles/popular', controllers.Article.getPopularArticles);
app.get('/articles/featured', controllers.Article.getFeaturedArticles);
app.post('/articles/category', controllers.Article.getCategoryArticles);
app.post('/articles/tag', controllers.Article.getTagArticles);
app.get('/articles/tag', controllers.Article.getArticlesByTag);
app.get('/articles/related', controllers.Article.getRelatedArticles);
app.get('/articles/:id', optionalAuth, controllers.Article.getArticleById);
app.post('/articles/:id/view', controllers.Article.incrementViewCount);
app.post('/articles/:id/like', requireAuth, controllers.Article.toggleLike);
app.post('/articles/:id/marked', requireAuth, controllers.Article.toggleBookmark);
app.get('/articles/:id/related', controllers.Article.getRelatedArticlesById);
app.get('/categories', controllers.Category.getCategories);
app.get('/categories/articles', controllers.Article.getArticles);
app.get('/categories/categoryarticles', controllers.Category.getCategoryArticlePairs);
app.get('/categories/:id', controllers.Category.getCategoryById);
app.get('/tags', controllers.Tag.getTags);
app.get('/tags/tagarticles', controllers.Tag.getTagArticlePairs);
app.get('/tags/:id', controllers.Tag.getTagById);
app.get('/frags', controllers.Frag.getFrags);
app.get('/frags/:id', controllers.Frag.getFragById);
app.get('/frags/mark/:mark', controllers.Frag.getFragByMark);
app.get('/siteinfo', controllers.Site.getSiteInfo);

app.get('/formulas', optionalAuth, controllers.Formula.getFormulas);
app.get('/formulas/:id', requireAuth, controllers.Formula.getFormulaById);
app.post('/formulas/:id/view', controllers.Formula.incrementViewCount);
app.post('/formulas/:id/like', requireAuth, controllers.Formula.toggleLike);
app.post('/formulas/:id/downloadcount', controllers.Formula.incrementDownloadCount);
app.post('/formulas/:id/marked', requireAuth, controllers.Formula.toggleBookmark);
//app.get('/formulas/:id/download', requireAuth, controllers.BaiduToken.getDownloadUrl)
//app.get('/formulas/:id/download', controllers.Formula.getDownloadUrl);

//app.get('/bdpan/list', controllers.BaiduToken.getPanFiles)
app.get('/bdpan/auth', controllers.BaiduToken.getBaiduAuthCode)
app.get('/bdpan/token', controllers.BaiduToken.getToken)
app.get('/bdpan/:id/download', requireAuth, controllers.BaiduToken.getDownloadUrl)

app.get('/comments', controllers.Comment.getComments);
app.post('/comments', optionalAuth, controllers.Comment.createComment);
app.get('/comments/my', requireAuth, controllers.Comment.getMyComments);
app.delete('/comments/:id', requireAuth, controllers.Comment.deleteComment);
app.post('/upload/qiniu-token', optionalAuth, controllers.Upload.getQiniuToken);

app.post('/member/register', controllers.Member.register);
app.post('/member/login', controllers.Member.login);

// ✅ 密码找回（公开）
app.post('/member/forgot-password', controllers.Member.forgotPassword);
app.get('/member/verify-reset-token', controllers.Member.verifyResetToken);
app.post('/member/reset-password', controllers.Member.resetPassword);
// 需要登录
app.get('/member/me', requireAuth, controllers.Member.getMe);
app.put('/member/me', requireAuth, controllers.Member.updateMe);
app.put('/member/password', requireAuth, controllers.Member.changePassword);
// ✅ 我的数据
app.get('/member/likes', requireAuth, controllers.Member.getMyLikes);
app.get('/member/bookmarks', requireAuth, controllers.Member.getMyBookmarks);
app.get('/member/downloads', requireAuth, controllers.Member.getMyDownloads);

app.get('/member/stats', requireAuth, controllers.Member.getMemberStats);

// 个人资料
app.get('/member/profile', requireAuth, controllers.Member.getMemberProfile);
app.put('/member/profile', requireAuth, controllers.Member.updateMemberProfile);

// 我的评论
app.get('/member/comments', requireAuth, controllers.Member.getMyComments);
app.delete('/member/comments/:id', requireAuth, controllers.Member.deleteMyComment);
// 导出处理函数
export default app;
