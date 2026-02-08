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
    addressdetails,
    extratags: 1,
    namedetails: 1
  };
  const headers = {
    'User-Agent': 'TravelBrain/1.0 (contacto@tucorreo.com)',
    'Accept-Language': 'es'
  };
  const response = await axios.get(url, { params, headers });
  
  // Ordenar resultados por importancia (place_rank y importance)
  const sortedResults = response.data.sort((a, b) => {
    // Priorizar países y ciudades principales
    const typeOrder = {
      'country': 1,
      'city': 2,
      'state': 3,
      'administrative': 4
    };
    
    const aOrder = typeOrder[a.type] || 100;
    const bOrder = typeOrder[b.type] || 100;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Si tienen el mismo tipo, ordenar por importancia
    return (b.importance || 0) - (a.importance || 0);
  });
  
  return sortedResults;
}

module.exports = { searchNominatim };
