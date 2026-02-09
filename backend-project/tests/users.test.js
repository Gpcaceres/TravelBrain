const request = require('supertest');
const app = require('../src/app');

describe('API /users', () => {
  it('GET /users debe retornar 200', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
  });

  it('POST /users debe crear un usuario', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'nuevo', password: '1234', email: 'nuevo@correo.com' });
    expect([200, 201]).toContain(res.statusCode);
  });
});
