const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Proxy endpoint for Nominatim geocoding to avoid CORS issues
 * GET /api/routing/geocode?q=query&limit=5
 */
router.get('/geocode', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          format: 'json',
          q,
          limit
        },
        headers: {
          'User-Agent': 'TravelBrain/1.0'
        },
        timeout: 10000
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to geocode location',
      error: error.message
    });
  }
});

/**
 * Proxy endpoint for OpenRouteService to avoid CORS issues
 * Uses POST method with body instead of query params (better for API)
 * POST /api/routing/directions
 */
router.post('/directions', async (req, res) => {
  try {
    const { start, end, profile = 'driving-car' } = req.body;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Start and end coordinates are required'
      });
    }

    // Parse coordinates
    const [startLng, startLat] = start.split(',').map(Number);
    const [endLng, endLat] = end.split(',').map(Number);

    const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || '5b3ce3597851110001cf62486bbfc1e6f98743e5b34bf5bf9e2e8b5c';
    
    // Use POST endpoint with coordinates in body (more reliable)
    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
      {
        coordinates: [[startLng, startLat], [endLng, endLat]]
      },
      {
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json, application/geo+json'
        },
        timeout: 15000
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Routing error:', error.response?.data || error.message);
    
    // Don't send error status, send 200 with fallback flag
    // This allows frontend to gracefully fallback to local calculation
    res.json({
      success: false,
      message: 'Routing API unavailable, use fallback',
      fallback: true,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Old GET endpoint for backward compatibility
 * GET /api/routing/directions?start=lng,lat&end=lng,lat&profile=driving-car
 */
router.get('/directions', async (req, res) => {
  try {
    const { start, end, profile = 'driving-car' } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Start and end coordinates are required'
      });
    }

    // Parse coordinates
    const [startLng, startLat] = start.split(',').map(Number);
    const [endLng, endLat] = end.split(',').map(Number);

    const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || '5b3ce3597851110001cf62486bbfc1e6f98743e5b34bf5bf9e2e8b5c';
    
    // Use POST endpoint (more reliable than GET)
    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
      {
        coordinates: [[startLng, startLat], [endLng, endLat]]
      },
      {
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Routing error:', error.response?.data || error.message);
    
    // Return fallback flag instead of error
    res.json({
      success: false,
      message: 'Routing API unavailable, use fallback',
      fallback: true,
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Calculate multimodal route with ports
 * POST /api/routing/multimodal
 */
router.post('/multimodal', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    // TODO: Implement multimodal routing logic
    res.json({
      success: true,
      data: {
        segments: [],
        totalDistance: 0,
        totalDuration: 0
      }
    });
  } catch (error) {
    console.error('Multimodal routing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate multimodal route',
      error: error.message
    });
  }
});

module.exports = router;
