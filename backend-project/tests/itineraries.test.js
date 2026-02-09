const request = require('supertest');
const app = require('../src/app');

describe('API /itineraries', () => {
  it('GET /itineraries debe retornar 200', async () => {
    const res = await request(app).get('/itineraries');
    expect(res.statusCode).toBe(200);
  });

  it('POST /itineraries debe crear un itinerario', async () => {
    const res = await request(app)
      .post('/itineraries')
      .send({ name: 'Itinerario Test', userId: 1 });
    expect([200, 201]).toContain(res.statusCode);
  });
});
