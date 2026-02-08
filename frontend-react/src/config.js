export const API_CONFIG = {
  BASE_URL: '',  // Use relative paths - Nginx will proxy to backend
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
    
    // Users
    USERS: '/api/users',
    USER_BY_ID: (id) => `/api/users/${id}`,
    
    // Destinations
    DESTINATIONS: '/api/destinations',
    DESTINATION_BY_ID: (id) => `/api/destinations/${id}`,
    
    // Trips
    TRIPS: '/api/trips',
    TRIP_BY_ID: (id) => `/api/trips/${id}`,
    
    // Favorite Routes
    FAVORITE_ROUTES: '/api/favorite-routes',
    FAVORITE_ROUTE_BY_ID: (id) => `/api/favorite-routes/${id}`,
    
    // Weather
    WEATHERS: '/api/weathers',
    WEATHER_BY_ID: (id) => `/api/weathers/${id}`,
    WEATHER_SEARCH: '/api/weather',
    WEATHER_LOCATION: '/api/weather/location'
  }
}

export const STORAGE_KEYS = {
  TOKEN: 'travelbrain_token',
  USER: 'travelbrain_user'
}

