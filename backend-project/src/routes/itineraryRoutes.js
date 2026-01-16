const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { protect } = require('../middlewares/auth');

/**
 * Itinerary Routes
 * All routes require authentication
 */

// Generate new itinerary
router.post('/generate', protect, itineraryController.generateItinerary);

// Get all itineraries for current user
router.get('/', protect, itineraryController.getUserItineraries);

// Get itinerary by ID
router.get('/:id', protect, itineraryController.getItineraryById);

// Get itinerary by trip ID
router.get('/trip/:tripId', protect, itineraryController.getItineraryByTripId);

// Delete itinerary
router.delete('/:id', protect, itineraryController.deleteItinerary);

module.exports = router;
