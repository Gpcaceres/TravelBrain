// Ejemplo de prueba unitaria para business rules
const request = require('supertest')
const app = require('../src/app')

describe('API /business-rules', () => {
  it('GET /business-rules debe retornar 200', async () => {
    const res = await request(app).get('/business-rules')
    expect(res.statusCode).toBe(200)
  })
})
