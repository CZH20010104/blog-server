const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./src/config/database');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const ResponseUtil = require('./src/utils/ResponseUtil');
const { helmetMiddleware, apiLimiter } = require('./src/middleware/security');
const { logger, morganMiddleware } = require('./src/config/logger');
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

// 安全中间件
app.use(helmetMiddleware);

// 日志中间件
app.use(morganMiddleware);

// 基本中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/public', express.static(path.join(__dirname, 'public')));

// API速率限制
app.use('/api', apiLimiter);

// 路由
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// 基础路由
app.get('/', (req, res) => {
    res.json(ResponseUtil.success({ message: '欢迎访问 Node.js 服务器！' }));
});

// 健康检查终端
app.get('/health', (req, res) => {
    res.json(ResponseUtil.success({ status: 'up', timestamp: new Date() }));
});

// 404 错误处理中间件
app.use((req, res) => {
    res.status(404).json(ResponseUtil.error(404, '找不到请求的资源', {
        path: req.originalUrl
    }));
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
    logger.error(`服务器错误: ${err.stack}`);
    const errorMessage = process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误';
    res.status(500).json(ResponseUtil.error(500, errorMessage));
});

// 数据库连接和服务器启动
const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info('数据库连接成功');

        // 同步数据库模型（开发环境可以使用，生产环境需谨慎）
        await sequelize.sync({ alter: true });
        logger.info('数据库模型同步完成');

        // 启动服务器
        app.listen(port, () => {
            logger.info(`服务器运行在 http://localhost:${port}`);
        });
    } catch (error) {
        logger.error(`无法连接到数据库: ${error.message}`);
        process.exit(1);
    }
};

// 只在直接运行时启动服务器
if (require.main === module) {
    startServer();
}

// 优雅关闭
process.on('SIGTERM', () => {
    logger.info('SIGTERM 信号收到，优雅关闭中...');
    process.exit(0);
});

module.exports = app;