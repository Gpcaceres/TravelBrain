// Prueba de cobertura para tripService
import { tripService } from '../services/tripService'

jest.mock('../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [{ id: 1, userId: 2 }] })),
  post: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
  put: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
  delete: jest.fn(() => Promise.resolve({ data: { id: 1 } }))
}))

describe('Cobertura tripService', () => {
  it('getAllTrips cubre respuesta', async () => {
    const trips = await tripService.getAllTrips()
    expect(trips.length).toBeGreaterThan(0)
  })

  it('getTripsByUserId cubre filtro', async () => {
    const trips = await tripService.getTripsByUserId(2)
    expect(trips[0].userId).toBe(2)
  })
})
