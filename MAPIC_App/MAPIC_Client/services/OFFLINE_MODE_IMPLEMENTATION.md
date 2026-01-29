# Offline Mode Implementation

## Overview

The MAPIC app now supports full offline mode with automatic queue management and sync when network restores. This implementation satisfies Requirements 12.4 and 12.5.

## Architecture

### Components

1. **OfflineQueueService** (`services/offline-queue.service.ts`)
   - Manages queued location updates in Realm database
   - Listens to network state changes via NetInfo
   - Automatically syncs queue when network restores
   - Periodic sync every 30 seconds

2. **HomeApiService** (`services/api/home.service.ts`)
   - Enhanced with Realm cache fallback for GET requests
   - Automatic queueing for POST requests when offline
   - Caches friend locations for offline access

3. **OfflineIndicator** (`components/ui/OfflineIndicator.tsx`)
   - Visual indicator shown when app is offline
   - Animated banner at top of screen
   - Informs user that updates will sync when online

4. **AppStore** (`store/app.store.ts`)
   - Tracks online/offline status globally
   - Updated automatically by OfflineQueueService

## Features

### 1. Fallback to Realm Cache (Requirement 12.4)

When API requests fail, the app automatically falls back to cached data:

```typescript
// Example: Fetching friends locations
const locations = await homeApiService.getFriendsLocations();
// If API fails, returns cached locations from Realm
```

**How it works:**
- Successful API responses are cached in Realm
- On failure, cached data is retrieved and returned
- Latest location per friend is used
- Graceful degradation - app continues to work offline

### 2. Offline Indicator UI (Requirement 12.4)

Visual feedback when offline:
- Orange banner at top of screen
- Shows "Offline Mode" with sync message
- Animated slide-in/slide-out
- Automatically appears/disappears based on network state

### 3. Queue Location Updates (Requirement 12.5)

Location updates are queued when offline:

```typescript
// Automatic queueing in homeApiService
await homeApiService.updateLocation(location);
// If offline, automatically queued in Realm
```

**Queue Management:**
- Stored in Realm database (persistent across app restarts)
- Maximum 100 items (oldest removed if exceeded)
- Retry logic with exponential backoff
- Failed items kept for retry

### 4. Sync When Network Restores (Requirement 12.5)

Automatic synchronization:
- Network state listener via NetInfo
- Immediate sync when network detected
- Periodic sync every 30 seconds
- Processes all queued updates sequentially

## Implementation Details

### Network Detection

Uses `@react-native-community/netinfo`:

```typescript
NetInfo.addEventListener((state) => {
  const isOnline = state.isConnected && state.isInternetReachable !== false;
  
  if (isOnline) {
    // Process queue
    offlineQueueService.processQueue();
  }
});
```

### Queue Storage

Queued items stored in Realm with special marker:

```typescript
// Location schema with userId = "QUEUED" for queued items
realm.create('Location', {
  _id: queueId,
  userId: 'QUEUED', // Special marker
  latitude: location.latitude,
  longitude: location.longitude,
  // ... other fields
});
```

### Cache Strategy

**Friends Locations:**
- Cache on successful fetch
- Group by userId, keep latest per friend
- Return cached data on API failure

**Own Location Updates:**
- Queue immediately if offline
- Send directly if online
- Queue on send failure

## Usage

### Initialization

Automatically initialized in `app/_layout.tsx`:

```typescript
useEffect(() => {
  offlineQueueService.initialize();
  
  return () => {
    offlineQueueService.cleanup();
  };
}, []);
```

### Checking Online Status

```typescript
import { useAppStore } from '@/store/app.store';

const isOnline = useAppStore((state) => state.isOnline);
```

### Manual Queue Processing

```typescript
import offlineQueueService from '@/services/offline-queue.service';

// Process queue manually
await offlineQueueService.processQueue();

// Get queue size
const size = offlineQueueService.getQueueSize();

// Clear queue
offlineQueueService.clearQueue();
```

## Testing

### Test Offline Mode

1. Enable Airplane Mode on device
2. Verify offline indicator appears
3. Move around - location updates should queue
4. Check queue size: `offlineQueueService.getQueueSize()`
5. Disable Airplane Mode
6. Verify queue processes automatically
7. Verify offline indicator disappears

### Test Cache Fallback

1. Load app with network
2. View friends locations (cached)
3. Enable Airplane Mode
4. Restart app
5. Verify friends locations still visible (from cache)

### Test Queue Persistence

1. Enable Airplane Mode
2. Move around to generate location updates
3. Force close app
4. Reopen app
5. Disable Airplane Mode
6. Verify queued updates sync

## Error Handling

### Network Errors
- Automatic retry with exponential backoff
- Queue on persistent failure
- User notified via offline indicator

### Queue Overflow
- Maximum 100 items
- Oldest items removed first
- Prevents memory issues

### Realm Errors
- Graceful fallback to empty data
- Error logged to console
- App continues to function

## Performance

### Memory Usage
- Queue limited to 100 items
- Old cached locations cleaned up
- Efficient Realm queries

### Battery Impact
- Periodic sync only every 30 seconds
- Network listener is lightweight
- No polling when offline

### Network Usage
- Batch processing of queue
- Exponential backoff reduces retries
- Only syncs when online

## Future Enhancements

1. **Conflict Resolution**
   - Handle conflicts when syncing old updates
   - Server-side timestamp validation

2. **Compression**
   - Compress queued updates
   - Reduce storage space

3. **Priority Queue**
   - Prioritize recent updates
   - Skip very old updates

4. **Analytics**
   - Track offline duration
   - Monitor queue size trends
   - Sync success rate

## Troubleshooting

### Queue Not Processing
- Check network state: `NetInfo.fetch()`
- Verify service initialized: `offlineQueueService.initialize()`
- Check console logs for errors

### Offline Indicator Not Showing
- Verify NetInfo installed: `@react-native-community/netinfo`
- Check app store: `useAppStore.getState().isOnline`
- Verify OfflineIndicator rendered in layout

### Cache Not Working
- Verify Realm initialized
- Check cache storage: `realmService.getRealm()`
- Verify API responses being cached

## Related Files

- `services/offline-queue.service.ts` - Queue management
- `services/api/home.service.ts` - API with cache fallback
- `components/ui/OfflineIndicator.tsx` - UI indicator
- `store/app.store.ts` - Online status tracking
- `app/_layout.tsx` - Service initialization

## Requirements Validation

✅ **Requirement 12.4**: Fallback to Realm cache when API fails
- Implemented in `homeApiService.getFriendsLocations()`
- Automatic cache on successful fetch
- Graceful fallback on failure

✅ **Requirement 12.4**: Show offline indicator in UI
- Implemented as `OfflineIndicator` component
- Animated banner with clear messaging
- Automatically shown/hidden based on network state

✅ **Requirement 12.5**: Queue location updates when offline
- Implemented in `offlineQueueService.addToQueue()`
- Persistent storage in Realm
- Automatic queueing in `homeApiService.updateLocation()`

✅ **Requirement 12.5**: Sync queued updates when network restores
- Implemented in `offlineQueueService.processQueue()`
- Automatic trigger on network restore
- Periodic sync every 30 seconds
