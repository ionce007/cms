//import mysql from 'mysql2/promise';
require('dotenv').config();

const { Sequelize } = require('sequelize');

const cfg =  {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'mysql',
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
};

const sequelize = new Sequelize(
  cfg.db.database,
  cfg.db.username,
  cfg.db.password,
  {
    host: cfg.db.host,
    port: cfg.db.port,
    dialect: cfg.db.dialect,
    pool: cfg.db.pool,
    logging: false
  }
);

module.exports = sequelize;