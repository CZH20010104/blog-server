const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

// 创建Redis客户端
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // 如果连接被拒绝，5秒后重试
            console.error('Redis服务器拒绝连接。重试中...');
            return 5000;
        }
        // 重连最大次数
        if (options.attempt > 10) {
            console.error('已达到最大重连次数，停止尝试连接Redis');
            return undefined;
        }
        // 指数退避重连策略
        return Math.min(options.attempt * 100, 3000);
    }
});

// 监听连接事件
redisClient.on('connect', () => {
    console.log('Redis客户端已连接');
});

redisClient.on('error', (err) => {
    console.error('Redis错误:', err);
});

// 将异步Redis命令转换为Promise
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

module.exports = {
    client: redisClient,
    get: getAsync,
    set: setAsync,
    del: delAsync,
    expire: expireAsync
}; 