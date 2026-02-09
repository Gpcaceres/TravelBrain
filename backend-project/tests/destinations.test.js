const request = require('supertest');
const app = require('../src/app');

describe('API /destinations', () => {
  it('GET /destinations debe retornar 200', async () => {
    const res = await request(app).get('/destinations');
    expect(res.statusCode).toBe(200);
  });

  it('POST /destinations debe crear un destino', async () => {
    const res = await request(app)
      .post('/destinations')
      .send({ name: 'Destino Test', country: 'Testlandia' });
    expect([200, 201]).toContain(res.statusCode);
  });
});
