# HƯỚNG DẪN MỤC 3 & 4 - BÀI TẬP A03

**Sinh viên:** Đào Nguyễn Nhật ANh
**MSSV:** 23110073
**Ngày:** 29/01/2026

---

## MỤC 3: XÂY DỰNG TRANG CHỦ

### 3.1. Cài đặt Tailwind CSS (NativeWind)

**Bước 1:** Cài đặt dependencies
```bash
cd MAPIC_App/MAPIC_Client
npm install nativewind
npm install --save-dev tailwindcss
```

**Bước 2:** Tạo file `tailwind.config.js`
```javascript
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        doraemonBlue: '#4A90E2',
        matchaGreen: '#B8D4A8',
        cream: '#FFF8E7',
      }
    }
  },
  plugins: [],
}
```

**Bước 3:** Cấu hình `babel.config.js`
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
```

### 3.2. Cài đặt React Navigation

**Bước 1:** Cài đặt Expo Router
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens
```

**Bước 2:** Tạo cấu trúc navigation

**File:** `app/_layout.tsx`
```typescript
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import realmService from '@/services/realm.service';
import offlineQueueService from '@/services/offline-queue.service';

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      await realmService.initialize();
      console.log('[App] Realm initialized');
      
      await offlineQueueService.initialize();
      console.log('[App] Offline queue initialized');
    };

    initializeApp();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

**File:** `app/(tabs)/_layout.tsx`
```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 3.3. Xây dựng Trang chủ (HomeScreen)

**File:** `app/(tabs)/index.tsx`

```typescript
import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocationStore } from '@/store/location.store';
import { useFriendsStore } from '@/store/friends.store';
import { defaultRegion } from '@/constants/mapStyle';
import { colors, spacing } from '@/constants/theme';
import BottomBar from '@/components/navigation/BottomBar';
import FriendAvatar from '@/components/map/FriendAvatar';
import AppLogo from '@/components/branding/AppLogo';

export default function HomeScreen() {
  const mapRef = useRef<MapView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(defaultRegion);

  const userLocation = useLocationStore((state) => state.currentLocation);
  const startTracking = useLocationStore((state) => state.startTracking);
  const stopTracking = useLocationStore((state) => state.stopTracking);
  
  const fetchFriendsLocations = useFriendsStore((state) => state.fetchFriendsLocations);
  const friendsLocations = useFriendsStore((state) => state.friendsLocations);

  useEffect(() => {
    initializeLocation();
    
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFriendsLocations();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchFriendsLocations]);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied');
        setIsLoading(false);
        return;
      }

      await startTracking();
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setMapRegion(initialRegion);
      setIsLoading(false);
    } catch (err) {
      console.error('Location initialization error:', err);
      setError('Failed to get location');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.doraemonBlue} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
      >
        {friendsLocations.map((friend) => (
          <FriendAvatar
            key={String(friend.userId)}
            userId={String(friend.userId)}
            userName={`User ${friend.userId}`}
            latitude={friend.latitude}
            longitude={friend.longitude}
            speed={friend.speed}
            heading={friend.heading}
            status={friend.status}
          />
        ))}
      </MapView>

      <View style={styles.logoContainer}>
        <AppLogo variant="compact" size="large" showText={false} />
      </View>

      <BottomBar
        onCenterPress={() => {/* Center map */}}
        onLeftPress={() => {/* Open chat */}}
        onRightPress={() => {/* Open friends */}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: 16,
    color: colors.gray[700],
  },
  logoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 16,
    zIndex: 10,
  },
});
```

### 3.4. Tạo Components

**File:** `components/navigation/BottomBar.tsx`
```typescript
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/constants/theme';

interface BottomBarProps {
  onCenterPress: () => void;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export default function BottomBar({
  onCenterPress,
  onLeftPress,
  onRightPress,
}: BottomBarProps) {
  
  const handleCenterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCenterPress();
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={onLeftPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.doraemonBlue} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.centerButton}
            onPress={handleCenterPress}
            activeOpacity={0.8}
          >
            <View style={styles.centerButtonInner}>
              <Ionicons name="navigate" size={28} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Ionicons name="people-outline" size={24} color={colors.doraemonBlue} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 248, 231, 0.8)',
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[6],
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  centerButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.doraemonBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## MỤC 4: SỬ DỤNG REALM DATABASE

### 4.1. Cài đặt Realm

```bash
npm install realm
```

### 4.2. Tạo Realm Schemas

**File:** `models/realm.ts`

```typescript
import Realm, { ObjectSchema } from 'realm';

export class Location extends Realm.Object<Location> {
  id!: string;
  userId!: string;
  latitude!: number;
  longitude!: number;
  speed!: number;
  heading!: number;
  accuracy!: number;
  timestamp!: Date;

  static schema: ObjectSchema = {
    name: 'Location',
    primaryKey: 'id',
    properties: {
      id: 'string',
      userId: 'string',
      latitude: 'double',
      longitude: 'double',
      speed: 'double',
      heading: 'double',
      accuracy: 'double',
      timestamp: 'date',
    },
  };
}

export class LocationUpdate extends Realm.Object<LocationUpdate> {
  id!: string;
  latitude!: number;
  longitude!: number;
  speed!: number;
  heading!: number;
  timestamp!: Date;
  synced!: boolean;

  static schema: ObjectSchema = {
    name: 'LocationUpdate',
    primaryKey: 'id',
    properties: {
      id: 'string',
      latitude: 'double',
      longitude: 'double',
      speed: 'double',
      heading: 'double',
      timestamp: 'date',
      synced: { type: 'bool', default: false },
    },
  };
}
```

### 4.3. Tạo Realm Service

**File:** `services/realm.service.ts`

```typescript
import Realm from 'realm';
import { Location, LocationUpdate } from '@/models/realm';

class RealmService {
  private realm: Realm | null = null;

  async initialize(): Promise<void> {
    if (this.realm) {
      console.log('[Realm] Already initialized');
      return;
    }

    try {
      this.realm = await Realm.open({
        schema: [Location, LocationUpdate],
        schemaVersion: 1,
      });
      console.log('Realm initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Realm:', error);
      throw error;
    }
  }

  getRealm(): Realm {
    if (!this.realm) {
      throw new Error('Realm not initialized. Call initialize() first.');
    }
    return this.realm;
  }

  saveLocation(location: {
    id: string;
    userId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    accuracy: number;
  }): void {
    const realm = this.getRealm();
    
    realm.write(() => {
      realm.create(
        'Location',
        {
          ...location,
          timestamp: new Date(),
        },
        Realm.UpdateMode.Modified
      );
    });
  }

  getLocations(): Location[] {
    const realm = this.getRealm();
    return Array.from(realm.objects<Location>('Location'));
  }

  close(): void {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
    }
  }
}

export default new RealmService();
```

### 4.4. Lưu thông tin tài khoản sau đăng nhập

**File:** `store/auth.store.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        console.log('[AuthStore] User logged in:', user.email);
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        console.log('[AuthStore] User logged out');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 4.5. Hiển thị thông tin lên trang chủ

**Cách 1: Hiển thị user info**

```typescript
import { useAuthStore } from '@/store/auth.store';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  
  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <Text>Email: {user?.email}</Text>
    </View>
  );
}
```

**Cách 2: Hiển thị location từ Realm**

```typescript
import realmService from '@/services/realm.service';

export default function HomeScreen() {
  const [locations, setLocations] = useState([]);
  
  useEffect(() => {
    const realm = realmService.getRealm();
    const allLocations = realm.objects('Location');
    setLocations(Array.from(allLocations));
  }, []);
  
  return (
    <MapView>
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          coordinate={{
            latitude: loc.latitude,
            longitude: loc.longitude,
          }}
        />
      ))}
    </MapView>
  );
}
```

**Cách 3: Sử dụng Zustand Store**

```typescript
import { useFriendsStore } from '@/store/friends.store';

export default function HomeScreen() {
  const friendsLocations = useFriendsStore((state) => state.friendsLocations);
  const fetchFriendsLocations = useFriendsStore((state) => state.fetchFriendsLocations);
  
  useEffect(() => {
    fetchFriendsLocations();
  }, []);
  
  return (
    <MapView>
      {friendsLocations.map((friend) => (
        <FriendAvatar
          key={friend.userId}
          latitude={friend.latitude}
          longitude={friend.longitude}
        />
      ))}
    </MapView>
  );
}
```

---

## KẾT QUẢ DEMO

### Trang chủ hiển thị:
1. ✅ Map với vị trí user (chấm xanh)
2. ✅ Vị trí bạn bè với emoji gadgets
3. ✅ Bottom navigation bar với glassmorphism
4. ✅ App logo ở góc trên trái
5. ✅ Thông tin user từ AsyncStorage
6. ✅ Location data từ Realm

### Chức năng hoạt động:
1. ✅ Tracking vị trí real-time
2. ✅ Lưu location vào Realm
3. ✅ Fetch friends locations từ API
4. ✅ Cache locations trong Realm
5. ✅ Offline mode với queue
6. ✅ Navigation giữa các màn hình

---

## KIỂM TRA

### Test Realm Database:
```typescript
// Trong console
const realm = realmService.getRealm();
const locations = realm.objects('Location');
console.log('Total locations:', locations.length);
console.log('Latest location:', locations.sorted('timestamp', true)[0]);
```

### Test AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check auth data
const authData = await AsyncStorage.getItem('auth-storage');
console.log('Auth data:', JSON.parse(authData));
```

### Test API Integration:
```typescript
// Trong HomeScreen
useEffect(() => {
  console.log('User:', user);
  console.log('Friends locations:', friendsLocations);
}, [user, friendsLocations]);
```

---

**Hoàn thành:** Mục 3 và 4 đã được triển khai đầy đủ theo yêu cầu.
