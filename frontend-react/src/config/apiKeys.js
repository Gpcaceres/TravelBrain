// API Configuration
export const API_KEYS = {
  // OpenWeatherMap API - Get your free key at: https://openweathermap.org/api
  WEATHER: import.meta.env.VITE_WEATHER_API_KEY || 'demo_key',
  
  // Google Maps API - Get your key at: https://console.cloud.google.com/
  GOOGLE_MAPS: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'demo_key'
}

export const API_ENDPOINTS = {
  WEATHER: 'https://api.openweathermap.org/data/2.5',
  GEOCODING: 'https://api.openweathermap.org/geo/1.0',
  GOOGLE_PLACES: 'https://maps.googleapis.com/maps/api/place',
  GOOGLE_GEOCODE: 'https://maps.googleapis.com/maps/api/geocode',
  GOOGLE_DISTANCE: 'https://maps.googleapis.com/maps/api/distancematrix'
}
