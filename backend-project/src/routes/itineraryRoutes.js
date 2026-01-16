const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');

/**
 * Itinerary Routes
 */

// Generate new itinerary
router.post('/generate', itineraryController.generateItinerary);

// Get all itineraries for current user
router.get('/', itineraryController.getUserItineraries);

// Get itinerary by ID
router.get('/:id', itineraryController.getItineraryById);

// Get itinerary by trip ID
router.get('/trip/:tripId', itineraryController.getItineraryByTripId);

// Delete itinerary
router.delete('/:id', itineraryController.deleteItinerary);

module.exports = router;
