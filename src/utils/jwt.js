const jwt = require('jsonwebtoken');
const { promisify } = require('util');
require('dotenv').config();

// 从环境变量中获取JWT配置
const JWT_SECRET = process.env.JWT_SECRET || '8a7d6f5e4c3b2a1098f7e6d5c4b3a5973';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 将回调风格的jwt函数转换为Promise风格
const signPromise = promisify(jwt.sign).bind(jwt)
const verifyPromise = promisify(jwt.verify).bind(jwt);

/**
 * 生成JWT令牌
 * @param {Object} payload - 要编码到令牌中的数据
 * @returns {Promise<string>} JWT令牌
 */
async function generateToken(payload) {
    return await signPromise(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证JWT令牌
 * @param {string} token - 要验证的JWT令牌
 * @returns {Promise<Object>} 解码后的payload数据
 */
async function verifyToken(token) {
    try {
        return await verifyPromise(token, JWT_SECRET);
    } catch (error) {
        throw error;
    }
}

/**
 * 从请求头中提取JWT令牌
 * @param {Object} req - Express请求对象
 * @returns {string|null} 提取的令牌或null
 */
function extractTokenFromHeader(req) {
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer ')
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

module.exports = {
    generateToken,
    verifyToken,
    extractTokenFromHeader
}; 