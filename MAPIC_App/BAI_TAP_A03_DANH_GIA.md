# BÀI TẬP A03 - ĐÁNH GIÁ CHI TIẾT

**Sinh viên:** [Tên sinh viên]  
**MSSV:** [MSSV]  
**Đề tài:** MAPIC - Ứng dụng chia sẻ vị trí thời gian thực  
**Ngày nộp:** 29/01/2026

---

## ✅ YÊU CẦU 1: BẢO MẬT API (4 CÁCH)

### 1.1. Input Validation - Xác thực đầu vào ✅

**File:** `MAPIC_App/MAPIC_Client/utils/security.ts`

```typescript
// Sanitize input để ngăn XSS
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// Validate email với regex mạnh
export const validateEmailStrict = (email: string)
```

**Áp dụng:** Register, Login, ForgotPassword
- Loại bỏ ký tự nguy hiểm (XSS)
- Validate format email
- Kiểm tra độ dài input

### 1.2. Rate Limiting - Giới hạn tần suất ✅

**File:** `MAPIC_App/MAPIC_Client/utils/security.ts`

```typescript
class RateLimiter {
  checkLimit(key: string, maxAttempts: number, windowMs: number, blockDurationMs: number)
}
```

**Áp dụng:**
- Login: Max 5 lần/phút, block 5 phút
- Register: Max 3 lần/5 phút
- ForgotPassword: Max 3 lần/10 phút

**Chống:** Brute-force attack, spam registration

### 1.3. Authentication - JWT Token ✅

**Backend:** `SecurityConfig.java`
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

**Frontend:** `auth.service.ts`
```typescript
async login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiService.post<AuthResponse>(
    API_ENDPOINTS.LOGIN, data
  );
  
  if (response.status === 'success' && response.data) {
    await this.saveToken(response.data.accessToken);
  }
}
```

**Áp dụng:**
- BCrypt hash password (backend)
- JWT token authentication
- Token lưu trong AsyncStorage
- Auto-attach token vào headers

### 1.4. Authorization - Phân quyền endpoint ✅

**File:** `SecurityConfig.java`

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/**").permitAll()
    .requestMatchers("/api/locations/**").permitAll()
    .anyRequest().authenticated()
)
```

**Phân quyền:**
- Public: /auth/**, /locations/** (testing)
- Protected: Các endpoint khác yêu cầu JWT

---

## ✅ YÊU CẦU 2: MÔ HÌNH KIẾN TRÚC

### 2.1. Kiến trúc MVVM ✅

```
MAPIC_Client/
├── models/          # Model - Realm schemas
│   └── realm.ts
├── viewmodels/      # ViewModel - Business logic
│   └── auth.viewmodel.ts
├── screens/         # View - UI components
│   └── auth/
├── services/        # Services - API calls
│   ├── auth.service.ts
│   └── api.service.ts
├── store/           # State management - Zustand
│   ├── auth.store.ts
│   └── location.store.ts
└── utils/           # Utilities
    └── security.ts
```

**Tuân thủ:**
- ✅ Model: Realm schemas (realm.ts)
- ✅ View: React components (screens/)
- ✅ ViewModel: Business logic (viewmodels/)
- ✅ Services: API integration
- ✅ Store: State management (Zustand)

### 2.2. Backend Architecture ✅

```
backend/
├── controllers/     # REST Controllers
│   ├── AuthController.java
│   └── LocationController.java
├── services/        # Business Logic
│   ├── AuthService.java
│   └── LocationService.java
├── repositories/    # Data Access
│   ├── UserRepository.java
│   └── LocationRepository.java
├── entities/        # JPA Entities
│   ├── User.java
│   └── Location.java
├── dtos/           # Data Transfer Objects
│   ├── LoginRequest.java
│   └── LocationResponse.java
└── config/         # Configuration
    └── SecurityConfig.java
```

**Tuân thủ:** Spring Boot MVC pattern

---

## ✅ YÊU CẦU 3: TRANG CHỦ VỚI TAILWIND CSS

### 3.1. Tailwind CSS / NativeWind ✅

**File:** `tailwind.config.js`
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
  }
}
```

**Package:** `nativewind` - Tailwind CSS cho React Native

### 3.2. React Navigation ✅

**File:** `app/_layout.tsx`
```typescript
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

**Navigation:**
- ✅ Expo Router (file-based routing)
- ✅ Tab navigation: Home, Profile, Settings
- ✅ Stack navigation: Auth flow

### 3.3. Trang chủ (HomeScreen) ✅

**File:** `app/(tabs)/index.tsx`

**Features:**
- ✅ Map view với OpenStreetMap
- ✅ Hiển thị vị trí user real-time
- ✅ Hiển thị vị trí bạn bè với emoji gadgets
- ✅ Bottom navigation bar (glassmorphism)
- ✅ App logo component
- ✅ Location tracking service

**UI Components:**
- `BottomBar.tsx` - Navigation với blur effect
- `FriendAvatar.tsx` - Avatar bạn bè trên map
- `AppLogo.tsx` - Logo component

---

## ✅ YÊU CẦU 4: REALM DATABASE

### 4.1. Realm Schema ✅

**File:** `models/realm.ts`

```typescript
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
```

### 4.2. Realm Service ✅

**File:** `services/realm.service.ts`

```typescript
class RealmService {
  async initialize(): Promise<void> {
    this.realm = await Realm.open({
      schema: [Location, LocationUpdate],
      schemaVersion: 1,
    });
  }

  saveLocation(location: LocationData): void {
    this.realm.write(() => {
      this.realm.create('Location', location, Realm.UpdateMode.Modified);
    });
  }
}
```

### 4.3. Lưu thông tin sau login ✅

**File:** `store/auth.store.ts`

```typescript
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
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Lưu trữ:**
- ✅ User info trong Zustand + AsyncStorage
- ✅ Location data trong Realm
- ✅ Offline queue trong Realm
- ✅ Token trong AsyncStorage

### 4.4. Hiển thị trên trang chủ ✅

**File:** `app/(tabs)/index.tsx`

```typescript
const userLocation = useLocationStore((state) => state.currentLocation);
const friendsLocations = useFriendsStore((state) => state.friendsLocations);

// Hiển thị user location
<MapView showsUserLocation={true} />

// Hiển thị friends locations
{friendsLocations.map((friend) => (
  <FriendAvatar
    userId={friend.userId}
    latitude={friend.latitude}
    longitude={friend.longitude}
  />
))}
```

---

## 📊 TỔNG KẾT

| Yêu cầu | Trạng thái | Ghi chú |
|---------|-----------|---------|
| **1. Bảo mật API (4 cách)** | ✅ HOÀN THÀNH | Input Validation, Rate Limiting, Authentication, Authorization |
| **2. Mô hình kiến trúc** | ✅ HOÀN THÀNH | MVVM + Spring Boot MVC |
| **3. Trang chủ + Tailwind** | ✅ HOÀN THÀNH | NativeWind + React Navigation + HomeScreen |
| **4. Realm Database** | ✅ HOÀN THÀNH | Realm schemas + Lưu user info + Hiển thị trang chủ |

---

## 📁 CẤU TRÚC DỰ ÁN

```
MAPIC_App/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/mapic/backend/
│   │       ├── config/        # SecurityConfig.java ✅
│   │       ├── controllers/   # AuthController, LocationController ✅
│   │       ├── services/      # Business logic ✅
│   │       ├── repositories/  # JPA repositories ✅
│   │       ├── entities/      # User, Location entities ✅
│   │       └── dtos/          # Request/Response DTOs ✅
│   └── pom.xml
│
└── MAPIC_Client/              # React Native Frontend
    ├── models/                # Realm schemas ✅
    ├── viewmodels/            # MVVM ViewModels ✅
    ├── screens/               # UI screens ✅
    ├── components/            # Reusable components ✅
    ├── services/              # API services ✅
    ├── store/                 # Zustand stores ✅
    ├── utils/                 # Security utilities ✅
    ├── constants/             # API endpoints, theme ✅
    ├── tailwind.config.js     # Tailwind CSS config ✅
    └── package.json
```

---

## 🔗 GITHUB REPOSITORY

**Repository:** [Link GitHub của bạn]  
**Commit message:** "bài tập A03"

---

## 📝 HƯỚNG DẪN CHẠY DỰ ÁN

### Backend (Spring Boot)
```bash
cd MAPIC_App/backend
./mvnw spring-boot:run
```

### Frontend (React Native)
```bash
cd MAPIC_App/MAPIC_Client
npm install
npx expo start
```

### Test API
```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test User"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

---

## 📸 SCREENSHOTS

[Thêm screenshots của:]
1. Màn hình đăng ký
2. Màn hình đăng nhập
3. Màn hình quên mật khẩu
4. Trang chủ với map
5. Realm database inspector

---

**Xác nhận:** Dự án đã hoàn thành đầy đủ 4 yêu cầu của bài tập A03.
