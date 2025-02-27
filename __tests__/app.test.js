const request = require('supertest');
const app = require('../app');

describe('App Tests', () => {
    test('GET / should return welcome message', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', '欢迎访问 Node.js 服务器！');
    });
}); 