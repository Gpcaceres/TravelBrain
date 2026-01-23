// API Configuration
export const API_KEYS = {
  // WeatherAPI.com - Get your FREE key at: https://www.weatherapi.com/signup.aspx
  // Free plan: 1,000,000 calls/month
  WEATHER: import.meta.env.VITE_WEATHER_API_KEY || 'a0bddd68132a4227b3b10907261401',
  
  // Google Maps API - Get your key at: https://console.cloud.google.com/
  GOOGLE_MAPS: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo_key',
  
  // OpenRouteService API - Free key for routing
  // Get your key at: https://openrouteservice.org/dev/#/signup
  // Free plan: 2,000 requests/day
  OPENROUTE: import.meta.env.VITE_OPENROUTE_API_KEY || '5b3ce3597851110001cf62486bbfc1e6f98743e5b34bf5bf9e2e8b5c',
  
  // GraphHopper API - More reliable routing alternative
  // Get your key at: https://graphhopper.com/dashboard/#/api-keys
  // Free plan: 500 requests/day
  GRAPHHOPPER: import.meta.env.VITE_GRAPHHOPPER_API_KEY || 'demo'
}

export const API_ENDPOINTS = {
  WEATHER: 'https://api.weatherapi.com/v1',
  GOOGLE_PLACES: 'https://maps.googleapis.com/maps/api/place',
  GOOGLE_GEOCODE: 'https://maps.googleapis.com/maps/api/geocode',
  GOOGLE_DISTANCE: 'https://maps.googleapis.com/maps/api/distancematrix',
  OPENROUTE: 'https://api.openrouteservice.org',
  GRAPHHOPPER: 'https://graphhopper.com/api/1'
}
