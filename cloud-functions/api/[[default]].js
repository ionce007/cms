import mysql2 from 'mysql2';
import { Sequelize } from 'sequelize';
import express from "express";

const { initializeDatabase, defineAssociations } = require('../models');
const controllers = require('../controllers');
const { validateImageUrl, validateImageFormat } = require('../common/image-validation');
const { requireAuth } = require('../middleware/auth');

const env = require('dotenv')
env.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//import app from "../index.js"; // 导入 index.js 中的 Express 应用
defineAssociations();

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

app.get("/sync-db", async (req, res) => {
    defineAssociations();
    const ret = await initializeDatabase();
    res.json(ret);
});

//app.get('/proxyimg', controllers.Image.proxyImage);
app.get("/imgproxy", validateImageUrl, validateImageFormat(), controllers.Image.imgProxy);// validateImageUrl, validateImageFormat(), controllers.Image.imgProxy);

app.get('/test', controllers.Article.test);
app.get('/articles', controllers.Article.getArticles);
app.post('/articles/search', controllers.Article.searchArticles);
app.get('/articles/pinned', controllers.Article.getPinnedArticles);
app.get('/articles/recent', controllers.Article.getRecentArticles);
app.get('/articles/popular', controllers.Article.getPopularArticles);
app.get('/articles/featured', controllers.Article.getFeaturedArticles);
app.post('/articles/category', controllers.Article.getCategoryArticles);
app.post('/articles/tag', controllers.Article.getTagArticles);
app.get('/articles/tag', controllers.Article.getArticlesByTag);
app.get('/articles/related', controllers.Article.getRelatedArticles);
app.get('/articles/:id', controllers.Article.getArticleById);
app.post('/articles/:id/view', controllers.Article.incrementViewCount);
app.post('/articles/:id/like', controllers.Article.toggleLike);
app.post('/articles/:id/marked', controllers.Article.toggleBookmark);
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

app.get('/formulas', controllers.Formula.getFormulas);
app.get('/formulas/:id', controllers.Formula.getFormulaById);
app.post('/formulas/:id/view', controllers.Formula.incrementViewCount);
app.post('/formulas/:id/like', controllers.Formula.toggleLike);
app.post('/formulas/:id/downloadcount', controllers.Formula.incrementDownloadCount);
app.post('/formulas/:id/like', controllers.Formula.toggleLike);
app.post('/formulas/:id/marked', controllers.Formula.toggleBookmark);
app.get('/formulas/:id/download', controllers.BaiduToken.getDownloadUrl)
//app.get('/formulas/:id/download', controllers.Formula.getDownloadUrl);

//app.get('/bdpan/list', controllers.BaiduToken.getPanFiles)
app.get('/bdpan/auth', controllers.BaiduToken.getBaiduAuthCode)
app.get('/bdpan/token', controllers.BaiduToken.getToken)

//app.get('/formulas', getFormulas);
//app.get('/formulas', getFormulas);

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
// 导出处理函数
export default app;
