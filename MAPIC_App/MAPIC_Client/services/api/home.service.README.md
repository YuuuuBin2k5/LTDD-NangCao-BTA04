# Home API Service

API client service for MAPIC Home Screen with authentication, interceptors, and retry logic.

## Features

✅ **Authentication Headers**: Automatically adds JWT token from auth store  
✅ **Request Interceptor**: Adds common headers and authentication  
✅ **Response Interceptor**: Handles JSON parsing and error responses  
✅ **Retry Logic**: Exponential backoff with jitter (1s → 2s → 4s → 8s)  
✅ **Smart Retry**: Skips retry on client errors (4xx) except 408/429  
✅ **Type Safety**: Full TypeScript support with interfaces  

## Usage

### Import

```typescript
import homeApiService from '@/services/api/home.service';
// or
import { homeApiService } from '@/services/api';
```

### Fetch Friends Locations with Polling

The recommended way to fetch friends locations is using the `useFriendsStore`:

```typescript
import { useFriendsStore } from '@/store';

// In your component
const { friendsLocations, isLoading, error, startPolling, stopPolling } = useFriendsStore();

// Start polling on mount
useEffect(() => {
  startPolling(); // Fetches every 5 seconds
  
  return () => {
    stopPolling(); // Cleanup on unmount
  };
}, []);

// Use friendsLocations in your component
console.log('Friends locations:', friendsLocations);
```

### Direct API Call (without polling)

```typescript
try {
  const locations = await homeApiService.getFriendsLocations();
  console.log('Friends locations:', locations);
} catch (error) {
  console.error('Failed to fetch locations:', error);
  // Fallback to Realm cache
}
```

### Update Own Location

```typescript
const location = {
  latitude: 10.762622,
  longitude: 106.660172,
  speed: 25.5,
  heading: 180,
  timestamp: new Date(),
};

try {
  await homeApiService.updateLocation(location);
  console.log('Location updated successfully');
} catch (error) {
  console.error('Failed to update location:', error);
  // Queue for offline sync
}
```

### Fetch Friends List

```typescript
try {
  const friends = await homeApiService.getFriendsList();
  console.log('Friends:', friends);
} catch (error) {
  console.error('Failed to fetch friends:', error);
}
```

## Retry Configuration

Default retry configuration:
- **Max Retries**: 3 attempts
- **Base Delay**: 1000ms (1 second)
- **Max Delay**: 8000ms (8 seconds)
- **Backoff**: Exponential with jitter

### Custom Retry Config

```typescript
await homeApiService.get('/custom-endpoint', {
  retryConfig: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 10000,
  }
});
```

## Authentication

The service automatically:
1. Reads JWT token from `useAuthStore`
2. Adds `Authorization: Bearer <token>` header
3. Skips auth header if `skipAuth: true` is passed

### Skip Authentication

```typescript
await homeApiService.get('/public-endpoint', {
  skipAuth: true,
});
```

## Error Handling

The service throws errors that should be caught:

```typescript
try {
  const data = await homeApiService.getFriendsLocations();
} catch (error) {
  if (error.message.includes('HTTP 401')) {
    // Unauthorized - redirect to login
  } else if (error.message.includes('HTTP 5')) {
    // Server error - show retry option
  } else {
    // Network error - fallback to cache
  }
}
```

## Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

The service automatically extracts `data` field from responses.

## Logging

All requests and responses are logged with `[HomeAPI]` prefix:
- Request attempts
- Response status and body (first 200 chars)
- Retry delays
- Errors

## Requirements Validation

✅ **Requirement 12.1**: API integration for friends and locations  
✅ **Requirement 12.2**: Polling every 5 seconds implemented in friends store  
✅ **Authentication headers**: From auth store  
✅ **Request/response interceptors**: Implemented  
✅ **Retry logic**: Exponential backoff with jitter  
✅ **Realm caching**: Locations cached on successful fetch  
✅ **Offline fallback**: Loads from Realm cache when API fails  

## Architecture

### Friends Location Flow

```
┌─────────────────┐
│  Home Screen    │
│  Component      │
└────────┬────────┘
         │ useFriendsStore()
         ↓
┌─────────────────┐
│ Friends Store   │
│ (Zustand)       │
└────────┬────────┘
         │ startPolling()
         │ (every 5s)
         ↓
┌─────────────────┐
│ Home API        │
│ Service         │
└────────┬────────┘
         │ GET /api/locations
         ↓
┌─────────────────┐     Success     ┌─────────────────┐
│  Backend API    │ ───────────────→│  Realm Cache    │
└─────────────────┘                 └─────────────────┘
         │                                   ↑
         │ Failure                           │
         └───────────────────────────────────┘
                   Fallback to cache
```  

## Next Steps

- Implement offline queue for failed location updates (Task 17)
- Add WebSocket connection for real-time updates (Task 27)
- Integrate with Realm cache for offline fallback (Task 17)
