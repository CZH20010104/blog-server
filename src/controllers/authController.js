const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const ResponseUtil = require('../utils/ResponseUtil');
const { logger } = require('../config/logger');
const redis = require('../config/redis');
const Joi = require('joi');

// 用户注册输入验证
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required()
});

// 用户登录输入验证
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

/**
 * 用户注册
 */
async function register(req, res) {
    try {
        // 验证请求数据
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json(ResponseUtil.error(400, `验证错误: ${error.details[0].message}`));
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({
            where: {
                email: value.email
            }
        });

        if (existingUser) {
            return res.status(409).json(ResponseUtil.error(409, '该邮箱已被注册'));
        }

        // 创建新用户
        const user = await User.create({
            username: value.username,
            email: value.email,
            password: value.password,
            role: 'user'
        });

        // 生成JWT令牌
        const token = await generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });

        logger.info(`新用户注册: ${user.email}`);

        // 返回成功响应
        res.status(201).json(ResponseUtil.success({
            message: '注册成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        }));
    } catch (error) {
        logger.error(`注册失败: ${error.message}`);
        res.status(500).json(ResponseUtil.error(500, '注册过程中发生错误'));
    }
}

/**
 * 用户登录
 */
async function login(req, res) {
    try {
        // 验证请求数据
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json(ResponseUtil.error(400, `验证错误: ${error.details[0].message}`));
        }

        // 查找用户
        const user = await User.findOne({
            where: {
                email: value.email
            }
        });

        if (!user) {
            return res.status(401).json(ResponseUtil.error(401, '邮箱或密码不正确'));
        }

        // 验证密码
        const isPasswordValid = await user.comparePassword(value.password);
        if (!isPasswordValid) {
            logger.warn(`登录失败: ${value.email} - 密码错误`);
            return res.status(401).json(ResponseUtil.error(401, '邮箱或密码不正确'));
        }

        // 更新最后登录时间
        user.lastLogin = new Date();
        await user.save();

        // 生成JWT令牌
        const token = await generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });

        logger.info(`用户登录: ${user.email}`);

        // 返回成功响应
        res.json(ResponseUtil.success({
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        }));
    } catch (error) {
        logger.error(`登录失败: ${error.message}`);
        res.status(500).json(ResponseUtil.error(500, '登录过程中发生错误'));
    }
}

/**
 * 用户登出
 */
async function logout(req, res) {
    try {
        // 从请求中获取令牌
        const token = req.user.token;

        if (token) {
            // 计算令牌过期时间（从JWT负载中）
            const payload = req.user;
            const expiryTime = payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : 3600;

            // 将令牌添加到Redis黑名单
            await redis.set(`blacklist:${token}`, 'true');
            await redis.expire(`blacklist:${token}`, expiryTime > 0 ? expiryTime : 0);

            logger.info(`用户登出: ${req.user.email || req.user.id}`);
        }

        res.json(ResponseUtil.success({ message: '成功登出' }));
    } catch (error) {
        logger.error(`登出失败: ${error.message}`);
        res.status(500).json(ResponseUtil.error(500, '登出过程中发生错误'));
    }
}

/**
 * 获取当前用户信息
 */
async function me(req, res) {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json(ResponseUtil.error(404, '用户不存在'));
        }

        res.json(ResponseUtil.success({ user }));
    } catch (error) {
        logger.error(`获取用户信息失败: ${error.message}`);
        res.status(500).json(ResponseUtil.error(500, '获取用户信息过程中发生错误'));
    }
}

module.exports = {
    register,
    login,
    logout,
    me
}; 