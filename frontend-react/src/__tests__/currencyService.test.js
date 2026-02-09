import * as currencyService from '../services/currencyService';

describe('currencyService', () => {
  it('debe tener métodos definidos', () => {
    expect(currencyService).toHaveProperty('getExchangeRates');
  });
});
