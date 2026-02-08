// Prueba de integración backend: login
const request = require('supertest')
const app = require('../src/app')

describe('API /auth/login', () => {
  it('POST /auth/login debe retornar 200', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'test', password: 'test' })
    expect(res.statusCode).toBe(200)
  })
})
