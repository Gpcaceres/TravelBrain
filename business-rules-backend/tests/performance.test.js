# Prueba de rendimiento business rules: endpoint trip
const request = require('supertest')
const app = require('../src/app')

describe('Rendimiento /business-rules/trip', () => {
  it('Responde en menos de 500ms', async () => {
    const start = Date.now()
    const res = await request(app).get('/business-rules/trip')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(500)
  })
})
