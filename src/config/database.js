const { Sequelize } = require('sequelize');
const path = require('path');

// 根据 NODE_ENV 加载对应的环境配置文件
require('dotenv').config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)
});

const isDevelopment = process.env.NODE_ENV === 'development';

const sequelize = new Sequelize(
    process.env.DB_NAME || 'blog_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    }
);

module.exports = sequelize; 