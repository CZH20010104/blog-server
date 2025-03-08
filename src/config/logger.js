const winston = require('winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 配置Winston日志格式
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'blog-server' },
    transports: [
        // 将所有日志写入文件
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log') 
        })
    ]
});

// 如果不是生产环境，则同时输出到控制台
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// 创建一个Morgan流以将HTTP请求日志传递给Winston
const stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// 配置Morgan中间件
const morganMiddleware = morgan(
    // 自定义格式，包含更多信息
    ':remote-addr :method :url :status :res[content-length] - :response-time ms',
    { stream }
);

module.exports = {
    logger,
    morganMiddleware
}; 