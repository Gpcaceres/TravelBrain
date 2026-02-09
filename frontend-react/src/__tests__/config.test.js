import { API_CONFIG, STORAGE_KEYS } from '../config';

describe('API_CONFIG', () => {
  it('debe tener endpoints definidos', () => {
    expect(API_CONFIG.ENDPOINTS.LOGIN).toBe('/api/auth/login');
    expect(API_CONFIG.ENDPOINTS.TRIPS).toBe('/api/trips');
    expect(typeof API_CONFIG.ENDPOINTS.USER_BY_ID).toBe('function');
    expect(API_CONFIG.ENDPOINTS.USER_BY_ID(5)).toBe('/api/users/5');
  });

  it('debe tener claves de almacenamiento definidas', () => {
    expect(STORAGE_KEYS.TOKEN).toBe('travelbrain_token');
    expect(STORAGE_KEYS.USER).toBe('travelbrain_user');
  });
});
