# Prueba de seguridad business rules: autorización
const request = require('supertest')
const app = require('../src/app')

describe('Seguridad /business-rules', () => {
  it('No permite acceso sin token', async () => {
    const res = await request(app).get('/business-rules/trip')
    expect(res.statusCode).toBe(401)
  })
})
