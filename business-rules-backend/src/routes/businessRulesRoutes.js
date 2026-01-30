

const express = require('express');
const router = express.Router();
const controller = require('../controllers/businessRulesController');

// Advertencia para intentos GET en rutas que solo aceptan POST
const warningGet = (req, res) => {
  res.status(405).json({
    warning: 'Método GET no permitido en esta ruta. Usa POST para validar o procesar datos.',
    path: req.originalUrl
  });
};

// User validation GET warning
router.get('/users/validate-registration', controller.validateUserRegistrationGet);
router.get('/users/validate-update', warningGet);

// Trip validation GET warning
router.get('/trips/validate-creation', controller.validateTripCreationGet);
router.get('/trips/validate-update', warningGet);
router.get('/trips/calculate-duration', warningGet);

// Destination validation GET warning
router.get('/destinations/validate-creation', controller.validateDestinationCreationGet);
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
// GET informativo para documentar la regla de negocio Perú-Lima
router.get('/docs/peru-lima-redirect', (req, res) => {
  res.json({
    rule: 'Si el país o nombre de destino es "Perú", se reemplaza automáticamente por "Perú, Lima" para evitar problemas de ruteo internacional.',
    appliesTo: ['origen', 'destino'],
    reason: 'El ruteo internacional Ecuador-Perú no es soportado correctamente por el proveedor de rutas. Lima sí tiene conectividad.',
    exampleInput: { name: 'Perú', country: 'Perú' },
    exampleOutput: { name: 'Perú, Lima', country: 'Perú, Lima' }
  });
});