const axios = require('axios');
const config = require('../config/env');

const BUSINESS_RULES_API_URL = process.env.BUSINESS_RULES_API_URL || 'http://localhost:3005';

/**
 * Client for Business Rules API
 */
class BusinessRulesClient {
  constructor() {
    this.client = axios.create({
      baseURL: `${BUSINESS_RULES_API_URL}/api/business-rules`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // User validations
  async validateUserRegistration(userData) {
    try {
      const response = await this.client.post('/users/validate-registration', userData);
      return response.data;
    } catch (error) {
      console.error('Error validating user registration:', error.message);
      throw error;
    }
  }

  async validateUserUpdate(userData) {
    try {
      const response = await this.client.post('/users/validate-update', userData);
      return response.data;
    } catch (error) {
      console.error('Error validating user update:', error.message);
      throw error;
    }
  }

  // Trip validations
  async validateTripCreation(tripData) {
    try {
      const response = await this.client.post('/trips/validate-creation', tripData);
      return response.data;
    } catch (error) {
      console.error('Error validating trip creation:', error.message);
      throw error;
    }
  }

  async validateTripUpdate(tripData) {
    try {
      const response = await this.client.post('/trips/validate-update', tripData);
      return response.data;
    } catch (error) {
      console.error('Error validating trip update:', error.message);
      throw error;
    }
  }

  async calculateTripDuration(startDate, endDate) {
    try {
      const response = await this.client.post('/trips/calculate-duration', { startDate, endDate });
      return response.data.duration;
    } catch (error) {
      console.error('Error calculating trip duration:', error.message);
      throw error;
    }
  }

  // Destination validations
  async validateDestinationCreation(destinationData) {
    try {
      const response = await this.client.post('/destinations/validate-creation', destinationData);
      return response.data;
    } catch (error) {
      console.error('Error validating destination creation:', error.message);
      throw error;
    }
  }

  async validateDestinationUpdate(destinationData) {
    try {
      const response = await this.client.post('/destinations/validate-update', destinationData);
      return response.data;
    } catch (error) {
      console.error('Error validating destination update:', error.message);
      throw error;
    }
  }

  // Route validations
  async validateRouteCreation(routeData) {
    try {
      const response = await this.client.post('/routes/validate-creation', routeData);
      return response.data;
    } catch (error) {
      console.error('Error validating route creation:', error.message);
      throw error;
    }
  }

  async validateRouteUpdate(routeData) {
    try {
      const response = await this.client.post('/routes/validate-update', routeData);
      return response.data;
    } catch (error) {
      console.error('Error validating route update:', error.message);
      throw error;
    }
  }

  // Itinerary business rules
  async generateItinerary(tripData, interestType, budgetType = null) {
    try {
      const response = await this.client.post('/itineraries/generate', {
        tripData,
        interestType,
        budgetType
      });
      return response.data;
    } catch (error) {
      console.error('Error generating itinerary:', error.message);
      throw error;
    }
  }

  async detectBudgetType(budget, days) {
    try {
      const response = await this.client.post('/itineraries/detect-budget-type', { budget, days });
      return response.data.budgetType;
    } catch (error) {
      console.error('Error detecting budget type:', error.message);
      throw error;
    }
  }

  async calculateBudgetBreakdown(totalBudget, budgetType, days) {
    try {
      const response = await this.client.post('/itineraries/calculate-budget-breakdown', {
        totalBudget,
        budgetType,
        days
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating budget breakdown:', error.message);
      throw error;
    }
  }

  async getActivityTemplates() {
    try {
      const response = await this.client.get('/itineraries/activity-templates');
      return response.data.templates;
    } catch (error) {
      console.error('Error getting activity templates:', error.message);
      throw error;
    }
  }
}

module.exports = new BusinessRulesClient();
