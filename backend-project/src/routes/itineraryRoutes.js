const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { authenticate } = require('../middlewares/auth');

/**
 * Itinerary Routes
 * All routes require authentication
 */

// Generate new itinerary
router.post('/generate', authenticate, itineraryController.generateItinerary);

// Get all itineraries for current user
router.get('/', authenticate, itineraryController.getUserItineraries);

// Get itinerary by ID
router.get('/:id', authenticate, itineraryController.getItineraryById);

// Get itinerary by trip ID
router.get('/trip/:tripId', authenticate, itineraryController.getItineraryByTripId);

// Delete itinerary
router.delete('/:id', authenticate, itineraryController.deleteItinerary);

module.exports = router;
