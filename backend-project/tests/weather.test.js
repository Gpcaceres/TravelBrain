const request = require('supertest');
const app = require('../src/app');

describe('API /weather', () => {
  it('GET /weather debe retornar 200', async () => {
    const res = await request(app).get('/weather?city=London');
    expect(res.statusCode).toBe(200);
  });
});
