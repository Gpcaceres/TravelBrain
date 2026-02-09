import { tripService } from '../services/tripService';

jest.mock('../services/api', () => ({
  get: jest.fn((url) => Promise.resolve({ data: [{ id: 1, userId: 2 }, { id: 2, userId: 3 }] })),
  post: jest.fn((url, data) => Promise.resolve({ data: { ...data, id: 99 } })),
  put: jest.fn((url, data) => Promise.resolve({ data: { ...data, updated: true } })),
  delete: jest.fn((url) => Promise.resolve({ data: { deleted: true } })),
}));

describe('tripService', () => {
  it('getAllTrips retorna todos los viajes', async () => {
    const trips = await tripService.getAllTrips();
    expect(Array.isArray(trips)).toBe(true);
    expect(trips.length).toBeGreaterThan(0);
  });

  it('getTripById retorna un viaje por ID', async () => {
    const trip = await tripService.getTripById(1);
    expect(trip).toBeDefined();
  });

  it('getTripsByUserId filtra por userId', async () => {
    const trips = await tripService.getTripsByUserId(2);
    expect(trips.every(t => t.userId === 2)).toBe(true);
  });

  it('createTrip retorna el viaje creado', async () => {
    const trip = await tripService.createTrip({ name: 'Test' });
    expect(trip.id).toBe(99);
    expect(trip.name).toBe('Test');
  });

  it('updateTrip retorna el viaje actualizado', async () => {
    const trip = await tripService.updateTrip(1, { name: 'Updated' });
    expect(trip.updated).toBe(true);
    expect(trip.name).toBe('Updated');
  });

  it('deleteTrip retorna confirmación de borrado', async () => {
    const result = await tripService.deleteTrip(1);
    expect(result.deleted).toBe(true);
  });
});
