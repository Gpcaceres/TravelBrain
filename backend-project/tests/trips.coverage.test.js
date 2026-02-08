// Prueba de cobertura backend: trips
const request = require('supertest')
const app = require('../src/app')

describe('Cobertura /trips', () => {
  it('GET /trips cubre respuesta', async () => {
    const res = await request(app).get('/trips')
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /trips cubre creación', async () => {
    const res = await request(app)
      .post('/trips')
      .send({ name: 'Viaje Test', userId: 2 })
    expect(res.statusCode).toBe(201)
  })
})
