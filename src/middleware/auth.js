const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { logger } = require('../config/logger');
const ResponseUtil = require('../utils/ResponseUtil');
const redis = require('../config/redis');

/**
 * 验证JWT令牌的中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
async function authenticate(req, res, next) {
    try {
        // 从请求头中提取令牌
        const token = extractTokenFromHeader(req);
        
        if (!token) {
            return res.status(401).json(ResponseUtil.error(401, '未提供认证令牌'));
        }
        
        // 检查令牌是否被撤销（加入黑名单）
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json(ResponseUtil.error(401, '令牌已失效'));
        }
        
        // 验证令牌
        const decoded = await verifyToken(token);
        
        // 将用户信息添加到请求对象
        req.user = decoded;
        
        next();
    } catch (error) {
        logger.error(`认证失败: ${error.message}`);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(ResponseUtil.error(401, '令牌已过期'));
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json(ResponseUtil.error(401, '无效的令牌'));
        }
        
        return res.status(500).json(ResponseUtil.error(500, '认证过程中发生错误'));
    }
}

/**
 * 创建基于角色的授权中间件
 * @param {Array} allowedRoles - 允许访问的角色数组
 * @returns {Function} Express中间件函数
 */
function authorize(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(ResponseUtil.error(401, '用户未认证'));
        }
        
        // 验证用户角色
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
            logger.warn(`用户 ${req.user.id} 尝试访问未授权资源`);
            return res.status(403).json(ResponseUtil.error(403, '没有权限访问此资源'));
        }
        
        next();
    };
}

module.exports = {
    authenticate,
    authorize
}; 