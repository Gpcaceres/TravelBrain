const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Proxy endpoint for OpenRouteService to avoid CORS issues
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

    const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || '5b3ce3597851110001cf62486bbfc1e6f98743e5b34bf5bf9e2e8b5c';
    
    const response = await axios.get(
      `https://api.openrouteservice.org/v2/directions/${profile}`,
      {
        params: {
          start,
          end
        },
        headers: {
          'Authorization': OPENROUTE_API_KEY,
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        },
        timeout: 10000
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Routing error:', error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to calculate route',
      error: error.message
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
