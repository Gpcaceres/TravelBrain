const userBusinessRules = require('../services/userBusinessRules');
const tripBusinessRules = require('../services/tripBusinessRules');
const destinationBusinessRules = require('../services/destinationBusinessRules');
const routeBusinessRules = require('../services/routeBusinessRules');
const itineraryBusinessRules = require('../services/itineraryBusinessRules');

/**
 * User validation controller
 */
exports.validateUserRegistration = (req, res) => {
  try {
    const result = userBusinessRules.validateRegistration(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.validateUserUpdate = (req, res) => {
  try {
    const result = userBusinessRules.validateUpdate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

/**
 * Trip validation controller
 */
exports.validateTripCreation = (req, res) => {
  try {
    const result = tripBusinessRules.validateCreation(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.validateTripUpdate = (req, res) => {
  try {
    const result = tripBusinessRules.validateUpdate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.calculateTripDuration = (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const duration = tripBusinessRules.calculateDuration(startDate, endDate);
    res.json({ duration });
  } catch (error) {
    res.status(500).json({ 
      duration: null, 
      error: error.message 
    });
  }
};

/**
 * Destination validation controller
 */
exports.validateDestinationCreation = (req, res) => {
  try {
    const result = destinationBusinessRules.validateCreation(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.validateDestinationUpdate = (req, res) => {
  try {
    const result = destinationBusinessRules.validateUpdate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.validateCoordinates = (req, res) => {
  try {
    const { lat, lng } = req.body;
    const result = destinationBusinessRules.validateCoordinatesOnly(lat, lng);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.calculateDistance = (req, res) => {
  try {
    const { lat1, lng1, lat2, lng2 } = req.body;
    const distance = destinationBusinessRules.calculateDistance(lat1, lng1, lat2, lng2);
    res.json({ distance });
  } catch (error) {
    res.status(500).json({ 
      distance: null, 
      error: error.message 
    });
  }
};

/**
 * Route validation controller
 */
exports.validateRouteCreation = (req, res) => {
  try {
    const result = routeBusinessRules.validateCreation(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.validateRouteUpdate = (req, res) => {
  try {
    const result = routeBusinessRules.validateUpdate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

/**
 * Itinerary business rules controller
 */
exports.generateItinerary = (req, res) => {
  try {
    const { tripData, interestType, budgetType } = req.body;
    const result = itineraryBusinessRules.generateItinerary(tripData, interestType, budgetType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.detectBudgetType = (req, res) => {
  try {
    const { budget, days } = req.body;
    const budgetType = itineraryBusinessRules.detectBudgetType(budget, days);
    res.json({ budgetType });
  } catch (error) {
    res.status(500).json({ 
      budgetType: null, 
      error: error.message 
    });
  }
};

exports.calculateBudgetBreakdown = (req, res) => {
  try {
    const { totalBudget, budgetType, days } = req.body;
    const breakdown = itineraryBusinessRules.calculateBudgetBreakdown(totalBudget, budgetType, days);
    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

exports.validateItineraryRequest = (req, res) => {
  try {
    const result = itineraryBusinessRules.validateItineraryRequest(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      valid: false, 
      error: error.message 
    });
  }
};

exports.getActivityTemplates = (req, res) => {
  try {
    const templates = itineraryBusinessRules.getActivityTemplates();
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ 
      templates: null, 
      error: error.message 
    });
  }
};
