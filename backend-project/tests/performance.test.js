# Prueba de rendimiento backend: endpoint trips
const request = require('supertest')
const app = require('../src/app')

describe('Rendimiento /trips', () => {
  it('Responde en menos de 500ms', async () => {
    const start = Date.now()
    const res = await request(app).get('/trips')
    const duration = Date.now() - start
    expect(duration).toBeLessThan(500)
  })
})
