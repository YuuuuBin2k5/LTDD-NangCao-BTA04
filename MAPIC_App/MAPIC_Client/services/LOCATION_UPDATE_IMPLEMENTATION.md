# Own Location Update API Implementation - Task 16

## Overview
This document verifies the implementation of Task 16: "Implement Own Location Update API"

## Requirements (12.3)
✅ WHEN update own location THEN hệ thống SHALL gọi API POST /api/locations mỗi 10s

## Implementation Summary

### 1. POST /api/locations Endpoint Call ✅
**File**: `services/location.service.ts`

```typescript
async sendLocationUpdate(location: LocationUpdate): Promise<void> {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    await apiService.post(
      '/locations',
      {
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed || 0,
        heading: location.heading || 0,
        timestamp: location.timestamp,
        status: location.status || 'stationary',
      },
      token
    );
  } catch (error) {
    console.error('Failed to send location update:', error);
    throw error;
  }
}
```

### 2. Send Current Location Every 10 Seconds ✅
**File**: `services/location.service.ts`

```typescript
startPeriodicUpdates(getCurrentLocation: () => LocationUpdate | null): void {
  if (this.updateInterval) {
    console.log('Periodic updates already running');
    return;
  }

  console.log('Starting periodic location updates (every 10 seconds)');

  this.updateInterval = setInterval(async () => {
    const location = getCurrentLocation();
    
    if (!location) {
      console.log('No location available for update');
      return;
    }

    try {
      await this.sendLocationUpdate(location);
      console.log('Location update sent successfully');
      
      // Try to process any queued updates
      await this.processQueue();
    } catch (error) {
      console.error('Failed to send location update, adding to queue:', error);
      this.addToQueue(location);
    }
  }, 10000); // 10 seconds
}
```

**Integration**: `store/location.store.ts`
```typescript
// Start periodic API updates (every 10 seconds)
locationService.startPeriodicUpdates(() => get().currentLocation);
```

### 3. Include Speed, Heading, Status in Payload ✅

**Updated Interface**: `services/location.service.ts`
```typescript
export interface LocationUpdate {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
  status?: string; // User status (walking, biking, driving, etc.)
}
```

**Payload Structure**:
```typescript
{
  latitude: location.latitude,
  longitude: location.longitude,
  speed: location.speed || 0,
  heading: location.heading || 0,
  timestamp: location.timestamp,
  status: location.status || 'stationary',
}
```

**Status Calculation**: `store/location.store.ts`
```typescript
function calculateStatus(speed: number | null): string {
  if (!speed || speed < 1) {
    return UserStatus.STATIONARY;
  } else if (speed < 10) {
    return UserStatus.WALKING;
  } else if (speed < 60) {
    return UserStatus.BIKING;
  } else {
    return UserStatus.DRIVING;
  }
}
```

### 4. Queue Updates When Offline ✅

**Queue Management**: `services/location.service.ts`

```typescript
addToQueue(location: LocationUpdate): void {
  const queuedUpdate: QueuedLocationUpdate = {
    ...location,
    id: `${Date.now()}-${Math.random()}`,
    retryCount: 0,
  };

  this.updateQueue.push(queuedUpdate);
  console.log(`Added location to queue. Queue size: ${this.updateQueue.length}`);

  // Limit queue size to prevent memory issues
  if (this.updateQueue.length > 100) {
    this.updateQueue.shift(); // Remove oldest
    console.log('Queue size exceeded 100, removed oldest update');
  }
}
```

**Queue Processing with Retry Logic**:
```typescript
async processQueue(): Promise<void> {
  if (this.isProcessingQueue || this.updateQueue.length === 0) {
    return;
  }

  this.isProcessingQueue = true;
  console.log(`Processing queue with ${this.updateQueue.length} updates`);

  const failedUpdates: QueuedLocationUpdate[] = [];

  for (const update of this.updateQueue) {
    try {
      await this.sendLocationUpdate(update);
      console.log(`Successfully sent queued update ${update.id}`);
    } catch (error) {
      console.error(`Failed to send queued update ${update.id}:`, error);
      
      // Retry logic with max 3 attempts
      if (update.retryCount < 3) {
        failedUpdates.push({
          ...update,
          retryCount: update.retryCount + 1,
        });
      } else {
        console.log(`Dropping update ${update.id} after 3 failed attempts`);
      }
    }
  }

  // Update queue with only failed updates
  this.updateQueue = failedUpdates;
  this.isProcessingQueue = false;

  console.log(`Queue processing complete. Remaining: ${this.updateQueue.length}`);
}
```

**Automatic Queue Processing**:
- When periodic update succeeds, it attempts to process queued updates
- Failed updates are automatically added to queue
- Queue has max size of 100 items (oldest removed when exceeded)
- Each update retries up to 3 times before being dropped

## Integration Flow

```
User Location Changes
        ↓
location.store.ts (calculateStatus)
        ↓
UserLocation with status
        ↓
locationService.startPeriodicUpdates()
        ↓
Every 10 seconds
        ↓
locationService.sendLocationUpdate()
        ↓
POST /api/locations
        ↓
Success: Process queue
Failure: Add to queue
```

## Files Modified

1. ✅ `services/location.service.ts`
   - Added `status` field to `LocationUpdate` interface
   - Updated `sendLocationUpdate()` to include status in payload
   - Queue management already implemented

2. ✅ `store/location.store.ts`
   - Added `status` field to `UserLocation` interface
   - Added `calculateStatus()` helper function
   - Updated `startTracking()` to calculate and include status
   - Updated `startBackgroundTracking()` to calculate and include status

3. ✅ `services/api/home.service.ts`
   - Added `status` field to `LocationPayload` interface

## Testing Verification

### Manual Testing Steps:
1. Start location tracking: `locationStore.startTracking()`
2. Verify location updates are sent every 10 seconds
3. Check console logs for "Location update sent successfully"
4. Simulate offline mode (airplane mode)
5. Verify updates are queued: `locationService.getQueueSize()`
6. Restore network connection
7. Verify queued updates are processed

### Expected Behavior:
- ✅ Location updates sent every 10 seconds
- ✅ Payload includes: latitude, longitude, speed, heading, timestamp, status
- ✅ Status calculated based on speed:
  - < 1 km/h: STATIONARY
  - < 10 km/h: WALKING
  - < 60 km/h: BIKING
  - >= 60 km/h: DRIVING
- ✅ Failed updates queued for retry
- ✅ Queue processed when network restored
- ✅ Max 3 retry attempts per update
- ✅ Queue limited to 100 items

## Compliance with Requirements

✅ **Requirement 12.3**: WHEN update own location THEN hệ thống SHALL gọi API POST /api/locations mỗi 10s

All task requirements completed:
- ✅ Create POST /api/locations endpoint call
- ✅ Send current location every 10 seconds
- ✅ Include speed, heading, status in payload
- ✅ Queue updates when offline

## Status: COMPLETE ✅
