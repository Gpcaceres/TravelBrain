// Prueba de cobertura business rules: trip
const request = require('supertest')
const app = require('../src/app')

describe('Cobertura /business-rules/trip', () => {
  it('GET /business-rules/trip cubre respuesta', async () => {
    const res = await request(app).get('/business-rules/trip')
    expect(res.statusCode).toBe(200)
  })

  it('POST /business-rules/trip cubre creación', async () => {
    const res = await request(app)
      .post('/business-rules/trip')
      .send({ name: 'Regla Test' })
    expect(res.statusCode).toBe(201)
  })
})
