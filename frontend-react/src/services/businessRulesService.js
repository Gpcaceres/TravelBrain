import api from './api'

// Call business rules backend to validate/transform destination
export const businessRulesService = {
  validateDestinationCreation: async (destinationData) => {
    // You may need to update the URL if your business rules backend runs on a different port
    const url = (import.meta.env.VITE_BUSINESS_RULES_URL || 'http://localhost:3005') + '/api/destinations/validate-creation';
    const response = await api.post(url, destinationData);
    return response.data;
  }
}
