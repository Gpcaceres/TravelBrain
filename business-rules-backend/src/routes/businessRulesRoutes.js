const express = require('express');
const router = express.Router();
const controller = require('../controllers/businessRulesController');

// User validation routes
router.post('/users/validate-registration', controller.validateUserRegistration);
router.post('/users/validate-update', controller.validateUserUpdate);

// Trip validation routes
router.post('/trips/validate-creation', controller.validateTripCreation);
router.post('/trips/validate-update', controller.validateTripUpdate);
router.post('/trips/calculate-duration', controller.calculateTripDuration);

// Destination validation routes
router.post('/destinations/validate-creation', controller.validateDestinationCreation);
router.post('/destinations/validate-update', controller.validateDestinationUpdate);
router.post('/destinations/validate-coordinates', controller.validateCoordinates);
router.post('/destinations/calculate-distance', controller.calculateDistance);

// Route validation routes
router.post('/routes/validate-creation', controller.validateRouteCreation);
router.post('/routes/validate-update', controller.validateRouteUpdate);

// Itinerary business rules routes
router.post('/itineraries/generate', controller.generateItinerary);
router.post('/itineraries/detect-budget-type', controller.detectBudgetType);
router.post('/itineraries/calculate-budget-breakdown', controller.calculateBudgetBreakdown);
router.post('/itineraries/validate-request', controller.validateItineraryRequest);
router.get('/itineraries/activity-templates', controller.getActivityTemplates);

module.exports = router;
