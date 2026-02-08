// Prueba de integración business rules: itinerario
const request = require('supertest')
const app = require('../src/app')

describe('API /business-rules/itinerary', () => {
  it('GET /business-rules/itinerary debe retornar 200', async () => {
    const res = await request(app).get('/business-rules/itinerary')
    expect(res.statusCode).toBe(200)
  })
})
