// Ejemplo de prueba unitaria para backend
const request = require('supertest')
const app = require('../src/app')

describe('API /trips', () => {
  it('GET /trips debe retornar 200', async () => {
    const res = await request(app).get('/trips')
    expect(res.statusCode).toBe(200)
  })
})
