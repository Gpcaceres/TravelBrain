// Advertencia para intentos GET en rutas que solo aceptan POST
const warningGet = (req, res) => {
	res.status(405).json({
		warning: 'Método GET no permitido en esta ruta. Usa POST para validar o procesar datos.',
		path: req.originalUrl
	});
};

// User validation GET warning
router.get('/users/validate-registration', warningGet);
router.get('/users/validate-update', warningGet);

// Trip validation GET warning
router.get('/trips/validate-creation', warningGet);
router.get('/trips/validate-update', warningGet);
router.get('/trips/calculate-duration', warningGet);

// Destination validation GET warning
router.get('/destinations/validate-creation', warningGet);
router.get('/destinations/validate-update', warningGet);
router.get('/destinations/validate-coordinates', warningGet);
router.get('/destinations/calculate-distance', warningGet);

// Route validation GET warning
router.get('/routes/validate-creation', warningGet);
router.get('/routes/validate-update', warningGet);

// Itinerary business rules GET warning
router.get('/itineraries/generate', warningGet);
router.get('/itineraries/detect-budget-type', warningGet);
router.get('/itineraries/calculate-budget-breakdown', warningGet);
router.get('/itineraries/validate-request', warningGet);
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
