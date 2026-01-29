/**
 * API Configuration and Endpoints
 * Centralized API configuration for MAPIC application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.mapic.app',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_BACKOFF_MULTIPLIER: 2, // Exponential backoff
};

// API Endpoints
export const API_ENDPOINTS = {
  // Location endpoints
  GET_LOCATIONS: '/api/locations',
  POST_LOCATION: '/api/locations',
  GET_USER_LOCATION: (userId: string) => `/api/locations/${userId}`,
  
  // User endpoints
  GET_USER_PROFILE: (userId: string) => `/api/users/${userId}`,
  UPDATE_USER_PROFILE: '/api/users/me',
  
  // Friends endpoints
  GET_FRIENDS: '/api/friends',
  GET_FRIEND_REQUESTS: '/api/friends/requests',
  SEND_FRIEND_REQUEST: '/api/friends/requests',
  ACCEPT_FRIEND_REQUEST: (requestId: string) => `/api/friends/requests/${requestId}/accept`,
  REJECT_FRIEND_REQUEST: (requestId: string) => `/api/friends/requests/${requestId}/reject`,
  
  // Chat endpoints (future)
  GET_CHATS: '/api/chats',
  GET_MESSAGES: (chatId: string) => `/api/chats/${chatId}/messages`,
  SEND_MESSAGE: (chatId: string) => `/api/chats/${chatId}/messages`,
  
  // Weather endpoints (optional)
  GET_WEATHER: '/api/weather',
  
  // POI endpoints (optional)
  GET_POIS: '/api/pois',
  SEARCH_POIS: '/api/pois/search',
};

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.mapic.app/ws',
  RECONNECT_INTERVAL: 5000, // 5 seconds
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
};

// Polling Configuration (fallback when WebSocket fails)
export const POLLING_CONFIG = {
  FRIENDS_LOCATION_INTERVAL: 5000, // 5 seconds
  OWN_LOCATION_INTERVAL: 10000, // 10 seconds
  BACKGROUND_LOCATION_INTERVAL: 30000, // 30 seconds
  WEATHER_INTERVAL: 1800000, // 30 minutes
};

// Request Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
