import * as weatherService from '../services/weatherService';

describe('weatherService', () => {
  it('debe tener métodos definidos', () => {
    expect(weatherService.weatherService).toHaveProperty('getWeatherById');
    expect(weatherService.weatherService).toHaveProperty('getAllWeatherSearches');
    expect(weatherService.weatherService).toHaveProperty('createWeatherSearch');
    expect(weatherService.weatherService).toHaveProperty('updateWeather');
    expect(weatherService.weatherService).toHaveProperty('deleteWeather');
  });
});
