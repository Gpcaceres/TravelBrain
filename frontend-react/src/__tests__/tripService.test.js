// Ejemplo de prueba unitaria para tripService
import { tripService } from '../services/tripService'

jest.mock('../services/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [{ id: 1, userId: 2 }] })),
  post: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
  put: jest.fn(() => Promise.resolve({ data: { id: 1 } })),
  delete: jest.fn(() => Promise.resolve({ data: { id: 1 } }))
}))

describe('tripService', () => {
  it('getAllTrips retorna lista', async () => {
    const trips = await tripService.getAllTrips()
    expect(trips).toEqual([{ id: 1, userId: 2 }])
  })

  it('getTripById retorna trip', async () => {
    const trip = await tripService.getTripById(1)
    expect(trip).toEqual([{ id: 1, userId: 2 }])
  })
})
