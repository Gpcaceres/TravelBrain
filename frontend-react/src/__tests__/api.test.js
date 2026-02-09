import api from '../services/api';

describe('api', () => {
  it('debe tener métodos get, post, put, delete', () => {
    expect(api).toHaveProperty('get');
    expect(api).toHaveProperty('post');
    expect(api).toHaveProperty('put');
    expect(api).toHaveProperty('delete');
  });
});
