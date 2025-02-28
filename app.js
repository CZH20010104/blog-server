const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');
const ResponseUtil = require('./src/utils/ResponseUtil');

const app = express();
const port = process.env.PORT || 8000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/users', userRoutes);

// 基础路由
app.get('/', (req, res) => {
    res.json(ResponseUtil.success({ message: '欢迎访问 Node.js 服务器！' }));
});

// 404 错误处理中间件
app.use((req, res) => {
    res.status(404).json(ResponseUtil.error(404, '找不到请求的资源', {
        path: req.originalUrl
    }));
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    const errorMessage = process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误';
    res.status(500).json(ResponseUtil.error(500, errorMessage));
});

// 数据库连接和服务器启动
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');

        // 同步数据库模型（开发环境可以使用，生产环境需谨慎）
        await sequelize.sync({ alter: true });
        console.log('数据库模型同步完成');

        // 启动服务器
        app.listen(port, () => {
            console.log(`服务器运行在 http://localhost:${port}`);
        });
    } catch (error) {
        console.error('无法连接到数据库:', error);
    }
};

// 只在直接运行时启动服务器
if (require.main === module) {
    startServer();
}

module.exports = app;