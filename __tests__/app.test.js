const request = require('supertest');
const app = require('../app');

describe('App Tests', () => {

    test('GET /api/users/getUsers', async () => {
        const response = await request(app).get('/api/users/getUsers');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', 'running');
        expect(response.body).toHaveProperty('timestamp');
    });
}); 