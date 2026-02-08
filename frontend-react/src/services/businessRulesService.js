import api from './api'

// Call business rules backend to validate/transform destination
export const businessRulesService = {
  validateDestinationCreation: async (destinationData) => {
    // Use relative path - Nginx will proxy to business-rules backend
    const url = '/business-rules/destinations/validate-creation';
    const response = await api.post(url, destinationData);
    return response.data;
  }
}
