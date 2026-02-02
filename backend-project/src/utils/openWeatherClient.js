const axios = require('axios');
const { openWeatherApiKey } = require('../config/env');

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Obtiene el clima actual por latitud y longitud desde OpenWeather
 * @param {number} lat
 * @param {number} lon
 * @param {string} [units] - unidades: 'metric', 'imperial' o 'standard'
 * @param {string} [lang] - idioma de la respuesta
 */
async function getCurrentWeather(lat, lon, units = 'metric', lang = 'es') {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        appid: openWeatherApiKey,
        units,
        lang
      }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

module.exports = {
  getCurrentWeather
};
