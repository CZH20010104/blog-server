const User = require('../models/User');
const ResponseUtil = require('../utils/ResponseUtil');

// 获取所有用户
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(ResponseUtil.success(users, '获取用户列表成功'));
    } catch (error) {
        res.status(500).json(ResponseUtil.error(500, error.message));
    }
};

// 创建新用户
const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        const { password, ...userWithoutPassword } = user.toJSON();
        res.status(201).json(ResponseUtil.success(userWithoutPassword, '用户创建成功'));
    } catch (error) {
        res.status(400).json(ResponseUtil.error(400, error.message));
    }
};

module.exports = {
    getUsers,
    createUser
}; 