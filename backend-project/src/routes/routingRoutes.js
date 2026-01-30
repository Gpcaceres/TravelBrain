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
          'User-Agent': 'TravelBrain/1.0 (https://github.com/Gpcaceres/TravelBrain)',
          'Accept': 'application/json'
        },
        timeout: 30000 // Increased to 30 seconds
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    
    // Return empty results instead of error to avoid breaking the UI
    res.json({
      success: true,
      data: [],
      fallback: true,
      message: 'Geocoding service unavailable, please try again'
    });
  }
});

/**
 * Proxy endpoint for routing services to avoid CORS issues
 * Tries GraphHopper first (more reliable), then falls back to OpenRouteService
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

    // Try GraphHopper first (more reliable)
    const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY;
    
    if (GRAPHHOPPER_API_KEY && GRAPHHOPPER_API_KEY !== 'demo') {
      try {
        const vehicle = profile.includes('car') ? 'car' : 'foot';
        
        // GraphHopper needs multiple 'point' parameters, not an array
        // Build URL manually because axios doesn't handle multiple params with same name correctly
        const ghUrl = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=${vehicle}&locale=en&points_encoded=false&key=${GRAPHHOPPER_API_KEY}`;
        
        console.log(`🚗 Calling GraphHopper API: ${vehicle} route from [${startLat},${startLng}] to [${endLat},${endLng}]`);
        
        const ghResponse = await axios.get(ghUrl, {
          timeout: 15000
        });

        if (ghResponse.data.paths && ghResponse.data.paths.length > 0) {
          const path = ghResponse.data.paths[0];
          
          // Convert GraphHopper response to GeoJSON format
          const geojson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {
                summary: {
                  distance: path.distance,
                  duration: path.time / 1000
                },
                segments: [{
                  distance: path.distance,
                  duration: path.time / 1000
                }]
              },
              geometry: {
                type: 'LineString',
                coordinates: path.points.coordinates
              }
            }]
          };

          return res.json({
            success: true,
            data: geojson,
            provider: 'graphhopper'
          });
        }
      } catch (ghError) {
        console.error('❌ GraphHopper error:', ghError.response?.data || ghError.message);
      }
    } else {
      console.log('⚠️  GraphHopper API key not configured, using OpenRouteService');
    }

    // Fallback to OpenRouteService
    const OPENROUTE_API_KEY = process.env.OPENROUTE_API_KEY || '5b3ce3597851110001cf62486bbfc1e6f98743e5b34bf5bf9e2e8b5c';
    
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
      data: response.data,
      provider: 'openrouteservice'
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
      return res.status(400).json({ success: false, message: 'Origin and destination are required' });
    }

    const AIRLABS_API_KEY = 'd4ca4f87-8d1a-48c5-9d3a-a85198df254e';
    const axios = require('axios');
    function haversine(a, b) {
      const toRad = deg => deg * Math.PI / 180;
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const aVal = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1-aVal));
    }


    // Buscar aeropuerto más cercano al origen
    const originAirportsResp = await axios.get(`https://airlabs.co/api/v9/nearby?lat=${origin.lat}&lng=${origin.lng}&distance=100&api_key=${AIRLABS_API_KEY}`);
    const originAirport = originAirportsResp.data.response.airports?.[0];
    if (!originAirport) return res.json({ success: false, message: 'No origin airport found', segments: [], totalDistance: 0, totalDuration: 0 });

    // Buscar aeropuerto más cercano al destino
    const destAirportsResp = await axios.get(`https://airlabs.co/api/v9/nearby?lat=${destination.lat}&lng=${destination.lng}&distance=100&api_key=${AIRLABS_API_KEY}`);
    const destAirport = destAirportsResp.data.response.airports?.[0];
    if (!destAirport) return res.json({ success: false, message: 'No destination airport found', segments: [], totalDistance: 0, totalDuration: 0 });

    let segments = [];
    let totalDistance = 0;
    let totalDuration = 0;


    // 1. Tramo terrestre: origen -> aeropuerto origen (API real)
    let ground1 = null;
    try {
      const response = await axios.post(
        'http://localhost:3004/api/routing/directions',
        {
          start: `${origin.lng},${origin.lat}`,
          end: `${originAirport.lng},${originAirport.lat}`,
          profile: 'driving-car'
        },
        { timeout: 20000 }
      );
      if (response.data.success && response.data.data.features && response.data.data.features[0]) {
        const route = response.data.data.features[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        segments.push({
          type: 'ground',
          coordinates: coords,
          distance: route.properties.summary.distance / 1000,
          label: `Drive to ${originAirport.name} Airport`
        });
        totalDistance += route.properties.summary.distance / 1000;
        totalDuration += route.properties.summary.duration / 3600;
      }
    } catch {}

    // 2. Tramo aéreo: aeropuerto origen -> aeropuerto destino
    const airDistance = haversine({ lat: originAirport.lat, lng: originAirport.lng }, { lat: destAirport.lat, lng: destAirport.lng });
    segments.push({
      type: 'air',
      coordinates: [ [originAirport.lat, originAirport.lng], [destAirport.lat, destAirport.lng] ],
      distance: airDistance,
      label: `${originAirport.name} to ${destAirport.name} (Flight)`
    });
    totalDistance += airDistance;
    totalDuration += airDistance / 800; // 800 km/h vuelo

    // 3. Tramo terrestre: aeropuerto destino -> destino (API real)
    let ground2 = null;
    try {
      const response = await axios.post(
        'http://localhost:3004/api/routing/directions',
        {
          start: `${destAirport.lng},${destAirport.lat}`,
          end: `${destination.lng},${destination.lat}`,
          profile: 'driving-car'
        },
        { timeout: 20000 }
      );
      if (response.data.success && response.data.data.features && response.data.data.features[0]) {
        const route = response.data.data.features[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        segments.push({
          type: 'ground',
          coordinates: coords,
          distance: route.properties.summary.distance / 1000,
          label: `Drive from ${destAirport.name} Airport`
        });
        totalDistance += route.properties.summary.distance / 1000;
        totalDuration += route.properties.summary.duration / 3600;
      }
    } catch {}

    // Si ambos tramos terrestres existen, devolverlos
    if (segments.length === 3) {
      res.json({
        success: true,
        data: {
          segments,
          totalDistance,
          totalDuration
        }
      });
    } else {
      res.json({
        success: false,
        message: 'No multimodal route found with real API',
        segments: [],
        totalDistance: 0,
        totalDuration: 0
      });
    }
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
