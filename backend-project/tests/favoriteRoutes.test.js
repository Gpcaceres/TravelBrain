const request = require('supertest');
const app = require('../src/app');

describe('API /favoriteRoutes', () => {
  it('GET /favoriteRoutes debe retornar 200', async () => {
    const res = await request(app).get('/favoriteRoutes');
    expect(res.statusCode).toBe(200);
  });

  it('POST /favoriteRoutes debe crear una ruta favorita', async () => {
    const res = await request(app)
      .post('/favoriteRoutes')
      .send({ name: 'Ruta Favorita Test', userId: 1 });
    expect([200, 201]).toContain(res.statusCode);
  });
});
