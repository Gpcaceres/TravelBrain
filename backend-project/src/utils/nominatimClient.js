const axios = require('axios');

/**
 * Proxy para Nominatim OpenStreetMap
 * @param {string} q - consulta de búsqueda
 * @param {number} [limit=5] - número de resultados
 * @param {number} [addressdetails=1] - incluir detalles de dirección
 * @returns {Promise<any>}
 */
async function searchNominatim(q, limit = 5, addressdetails = 1) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const params = {
    format: 'json',
    q,
    limit,
    addressdetails
  };
  const headers = {
    'User-Agent': 'TravelBrain/1.0 (contacto@tucorreo.com)',
    'Accept-Language': 'es'
  };
  const response = await axios.get(url, { params, headers });
  return response.data;
}

module.exports = { searchNominatim };
