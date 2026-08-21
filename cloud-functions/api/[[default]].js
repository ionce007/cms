import mysql2 from 'mysql2';
import { Sequelize } from 'sequelize';
import express from "express";

const { initializeDatabase } = require('../models');
const controllers = require('../controllers');

const env = require('dotenv')
env.config();

const app = express();

//import app from "../index.js"; // 导入 index.js 中的 Express 应用

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
    const ret = await initializeDatabase();
    res.json(ret);
});

app.get('/articles', controllers.Article.getArticles);
app.get('/articles/:id', controllers.Article.getArticleById);
app.get('/articles/pinned', controllers.Article.getPinnedArticles);
app.get('/categories', controllers.Article.getCategories);
app.get('/tags', controllers.Article.getTags);

// 导出处理函数
export default app;
