const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 获取所有用户
router.get('/getUsers', userController.getUsers);

// 创建新用户
router.post('/createUser', userController.createUser);

module.exports = router; 