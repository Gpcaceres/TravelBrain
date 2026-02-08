# Prueba de seguridad backend: autenticación
const request = require('supertest')
const app = require('../src/app')

describe('Seguridad /auth', () => {
  it('No permite acceso sin token', async () => {
    const res = await request(app).get('/trips')
    expect(res.statusCode).toBe(401)
  })
})
