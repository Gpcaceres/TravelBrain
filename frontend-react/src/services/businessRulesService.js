import api from './api'

// Call business rules backend to validate/transform destination
export const businessRulesService = {
  validateDestinationCreation: async (destinationData) => {
    // Usar la IP pública del backend de reglas de negocio
    const url = 'http://35.239.79.6:3005/api/business-rules/destinations/validate-creation';
    const response = await api.post(url, destinationData);
    return response.data;
  }
}
