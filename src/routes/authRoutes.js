const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/security');

// 用户注册
router.post('/register', authController.register);

// 用户登录（应用登录限速中间件）
router.post('/login', loginLimiter, authController.login);

// 用户登出（需要认证）
router.post('/logout', authenticate, authController.logout);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, authController.me);

module.exports = router; 