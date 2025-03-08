const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger } = require('../config/logger');
const ResponseUtil = require('../utils/ResponseUtil');

/**
 * 配置Helmet中间件
 * 设置各种HTTP标头以帮助保护应用程序
 */
const helmetMiddleware = helmet();

/**
 * API请求限制器中间件
 * 限制每个IP在一定时间内的请求数量，防止暴力攻击
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP在windowMs内的最大请求数
    standardHeaders: true, // 返回RateLimit-*标头
    legacyHeaders: false, // 禁用X-RateLimit-*标头
    handler: (req, res) => {
        logger.warn(`IP ${req.ip} 超过速率限制`);
        return res.status(429).json(
            ResponseUtil.error(429, '请求过于频繁，请稍后再试')
        );
    }
});

/**
 * 登录限制器中间件
 * 对登录请求进行更严格的限制，防止暴力密码破解
 */
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小时
    max: 10, // 每个IP在windowMs内的最大请求数
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`IP ${req.ip} 尝试进行过多登录请求`);
        return res.status(429).json(
            ResponseUtil.error(429, '登录尝试次数过多，请1小时后再试')
        );
    }
});

module.exports = {
    helmetMiddleware,
    apiLimiter,
    loginLimiter
}; 