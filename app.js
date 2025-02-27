const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
    res.json({ message: '欢迎访问 Node.js 服务器！' });
});

// 只在直接运行时启动服务器
if (require.main === module) {
    app.listen(port, () => {
        console.log(`服务器运行在 http://localhost:${port}`);
    });
}

module.exports = app;
