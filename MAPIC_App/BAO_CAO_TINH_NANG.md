# BÁO CÁO TRIỂN KHAI TÍNH NĂNG - ỨNG DỤNG MAPIC

**Sinh viên thực hiện:** [Tên sinh viên]  
**MSSV:** [Mã số sinh viên]  
**Lớp:** [Lớp]  
**Ngày nộp:** 03/02/2026

---

## MỤC LỤC

1. [Tính năng 1: Quản lý Profile Người dùng](#tinh-nang-1)
2. [Tính năng 2: Tìm kiếm & Lọc Bạn bè](#tinh-nang-2)
3. [Tính năng 3: Xem Chi tiết Bạn bè & Địa điểm](#tinh-nang-3)
4. [Hướng dẫn Cài đặt & Chạy Ứng dụng](#huong-dan)
5. [Kết luận](#ket-luan)

---

<a name="tinh-nang-1"></a>
## 1. TÍNH NĂNG QUẢN LÝ PROFILE NGƯỜI DÙNG

### 1.1. Mô tả tính năng

Tính năng cho phép người dùng đã đăng nhập quản lý thông tin cá nhân bao gồm:
- Chỉnh sửa Avatar (upload ảnh đại diện)
- Cập nhật Họ tên
- Đổi mật khẩu (yêu cầu mật khẩu cũ)
- Đổi số điện thoại (có xác thực OTP qua SMS)
- Đổi email (có xác thực OTP qua email)

### 1.2. Công nghệ sử dụng

**Backend:**
- Spring Boot 3.x
- Spring Security với JWT Authentication
- JavaMail API cho gửi OTP email
- MySQL Database
- Lombok, MapStruct

**Frontend:**
- React Native với Expo
- TypeScript
- Expo Image Picker
- Realm Database (offline storage)
- Axios cho API calls

### 1.3. Kiến trúc Backend

#### 1.3.1. Entities

**User Entity** (`User.java`)
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String avatarUrl;
    // ... other fields
}
```

**OTP Entity** (`Otp.java`)
```java
@Entity
@Table(name = "otps")
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String otpCode;
    private LocalDateTime expiryTime;
    private Boolean isUsed;
}
```


#### 1.3.2. DTOs (Data Transfer Objects)

**UpdateProfileRequest.java**
```java
@Data
public class UpdateProfileRequest {
    private String fullName;
    private String avatarUrl;
}
```

**ChangePasswordRequest.java**
```java
@Data
public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
}
```

**ChangeEmailRequest.java**
```java
@Data
public class ChangeEmailRequest {
    private String newEmail;
    private String otp;
}
```

**ChangePhoneRequest.java**
```java
@Data
public class ChangePhoneRequest {
    private String newPhone;
    private String otp;
}
```

#### 1.3.3. Services

**UserService.java** - Xử lý logic nghiệp vụ
- `updateProfile()`: Cập nhật thông tin cơ bản
- `changePassword()`: Đổi mật khẩu với xác thực
- `changeEmail()`: Đổi email với OTP
- `changePhone()`: Đổi số điện thoại với OTP

**OtpService.java** - Quản lý OTP
- `generateOtp()`: Tạo mã OTP 6 số ngẫu nhiên
- `sendOtpEmail()`: Gửi OTP qua email
- `verifyOtp()`: Xác thực OTP
- `cleanupExpiredOtps()`: Xóa OTP hết hạn

**EmailService.java** - Gửi email
- `sendOtpEmail()`: Gửi email chứa mã OTP
- Template email được format HTML đẹp mắt

#### 1.3.4. Controllers

**UserController.java** - REST API Endpoints

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    // Lấy thông tin profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile()
    
    // Cập nhật profile
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile()
    
    // Đổi mật khẩu
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword()
    
    // Gửi OTP để đổi email
    @PostMapping("/send-otp-email")
    public ResponseEntity<ApiResponse<String>> sendOtpForEmail()
    
    // Xác nhận đổi email
    @PostMapping("/change-email")
    public ResponseEntity<ApiResponse<UserResponse>> changeEmail()
    
    // Gửi OTP để đổi phone
    @PostMapping("/send-otp-phone")
    public ResponseEntity<ApiResponse<String>> sendOtpForPhone()
    
    // Xác nhận đổi phone
    @PostMapping("/change-phone")
    public ResponseEntity<ApiResponse<UserResponse>> changePhone()
}
```


### 1.4. Kiến trúc Frontend

#### 1.4.1. Services

**user.service.ts** - API Client
```typescript
class UserService {
  async getProfile(token: string): Promise<UserResponse>
  async updateProfile(data: UpdateProfileRequest, token: string)
  async changePassword(data: ChangePasswordRequest, token: string)
  async sendOtpForEmail(email: string, token: string)
  async changeEmail(data: ChangeEmailRequest, token: string)
  async sendOtpForPhone(phone: string, token: string)
  async changePhone(data: ChangePhoneRequest, token: string)
}
```

#### 1.4.2. Screens

**edit-profile.screen.tsx** - Màn hình chỉnh sửa profile
- Form nhập thông tin: Full Name, Email, Phone
- Button chọn và upload Avatar
- Button đổi mật khẩu
- Xác thực OTP khi đổi email/phone
- Loading states và error handling
- Design theo Doraemon Space Theme

**Các tính năng UI:**
- Avatar picker với Expo Image Picker
- Form validation
- OTP input với countdown timer
- Success/Error notifications
- Responsive design
- Glassmorphism effects

### 1.5. Flow hoạt động

#### 1.5.1. Đổi Email với OTP

```
1. User nhập email mới → Click "Send OTP"
2. Frontend gọi POST /api/v1/users/send-otp-email
3. Backend:
   - Kiểm tra email đã tồn tại chưa
   - Generate OTP 6 số
   - Lưu vào database với thời gian hết hạn (5 phút)
   - Gửi email chứa OTP
4. User nhận email → Nhập OTP
5. Frontend gọi POST /api/v1/users/change-email
6. Backend:
   - Verify OTP
   - Cập nhật email mới
   - Đánh dấu OTP đã sử dụng
7. Trả về thông tin user đã cập nhật
```

#### 1.5.2. Đổi Mật khẩu

```
1. User nhập mật khẩu cũ và mật khẩu mới
2. Frontend gọi POST /api/v1/users/change-password
3. Backend:
   - Verify mật khẩu cũ
   - Hash mật khẩu mới với BCrypt
   - Cập nhật vào database
4. Trả về thông báo thành công
```

### 1.6. Screenshots

**Màn hình Edit Profile:**
- Form chỉnh sửa thông tin
- Avatar picker
- Buttons đổi email/phone/password

**Màn hình OTP Verification:**
- Input OTP 6 số
- Countdown timer
- Resend OTP button

### 1.7. API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/users/profile` | Lấy thông tin profile |
| PUT | `/api/v1/users/profile` | Cập nhật profile |
| POST | `/api/v1/users/change-password` | Đổi mật khẩu |
| POST | `/api/v1/users/send-otp-email` | Gửi OTP qua email |
| POST | `/api/v1/users/change-email` | Xác nhận đổi email |
| POST | `/api/v1/users/send-otp-phone` | Gửi OTP qua SMS |
| POST | `/api/v1/users/change-phone` | Xác nhận đổi phone |

### 1.8. Database Schema

**Table: users**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Table: otps**
```sql
CREATE TABLE otps (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```


---

<a name="tinh-nang-2"></a>
## 2. TÍNH NĂNG TÌM KIẾM & LỌC BẠN BÈ

### 2.1. Mô tả tính năng

Tính năng cho phép người dùng:
- Tìm kiếm bạn bè theo tên, email
- Lọc bạn bè theo trạng thái: All / Online / Offline
- Lọc theo khoảng cách: Nearby (<1km), <5km, <10km
- Lọc theo hoạt động: Walking, Biking, Driving, Stationary
- Hiển thị danh sách bạn bè với thông tin khoảng cách và trạng thái

### 2.2. Kiến trúc Backend

#### 2.2.1. Entities

**Friendship Entity** (`Friendship.java`)
```java
@Entity
@Table(name = "friendships")
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "friend_id")
    private User friend;
    
    @Enumerated(EnumType.STRING)
    private FriendshipStatus status; // PENDING, ACCEPTED, BLOCKED
    
    private LocalDateTime createdAt;
}
```

#### 2.2.2. DTOs

**FriendSearchRequest.java**
```java
@Data
public class FriendSearchRequest {
    private String query;           // Tìm kiếm theo tên/email
    private String status;          // ONLINE, OFFLINE, ALL
    private Integer maxDistance;    // Khoảng cách tối đa (meters)
    private String activityStatus;  // walking, biking, driving, stationary
    private Double latitude;        // Vị trí hiện tại của user
    private Double longitude;
}
```

**FriendResponse.java**
```java
@Data
public class FriendResponse {
    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String status;          // ONLINE, OFFLINE, AWAY
    private String activityStatus;  // walking, biking, driving
    private Double distance;        // Khoảng cách tính bằng meters
    private Double latitude;
    private Double longitude;
}
```

#### 2.2.3. Services

**FriendService.java**
```java
@Service
public class FriendService {
    
    // Tìm kiếm bạn bè với filters
    public List<FriendResponse> searchFriends(
        Long userId, 
        FriendSearchRequest request
    ) {
        // 1. Lấy danh sách bạn bè
        // 2. Filter theo query (tên, email)
        // 3. Filter theo status
        // 4. Tính khoảng cách (Haversine formula)
        // 5. Filter theo maxDistance
        // 6. Filter theo activityStatus
        // 7. Sort theo khoảng cách
        return friends;
    }
    
    // Tính khoảng cách giữa 2 điểm (Haversine formula)
    private double calculateDistance(
        double lat1, double lon1, 
        double lat2, double lon2
    ) {
        // Công thức Haversine
        // Trả về khoảng cách tính bằng meters
    }
}
```


#### 2.2.4. Controllers

**FriendController.java**
```java
@RestController
@RequestMapping("/api/v1/friends")
public class FriendController {
    
    // Tìm kiếm bạn bè
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<FriendResponse>>> searchFriends(
        @RequestBody FriendSearchRequest request
    )
    
    // Lấy danh sách tất cả bạn bè
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<FriendResponse>>> getFriendsList()
    
    // Thêm bạn
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<String>> addFriend(
        @RequestBody AddFriendRequest request
    )
    
    // Xóa bạn
    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<String>> removeFriend(
        @PathVariable Long friendId
    )
}
```

### 2.3. Kiến trúc Frontend

#### 2.3.1. Components

**FriendCard.tsx** - Card hiển thị thông tin bạn bè
```typescript
interface FriendCardProps {
  friend: FriendResponse;
  onPress: () => void;
}

// Features:
- Avatar với status indicator (online/offline)
- Tên và khoảng cách
- Activity icon (walking/biking/driving)
- Glassmorphism design
- Touch feedback
```

**FilterButtons.tsx** - Buttons lọc
```typescript
interface FilterButtonsProps {
  statusFilter: 'ALL' | 'ONLINE' | 'OFFLINE';
  distanceFilter: number | null;
  activityFilter: string | null;
  onStatusChange: (status) => void;
  onDistanceChange: (distance) => void;
  onActivityChange: (activity) => void;
}

// Features:
- 3 nhóm filter: Status, Distance, Activity
- Horizontal scroll
- Active state styling
- Theme colors
```

#### 2.3.2. Screens

**friends-list.screen.tsx** - Màn hình danh sách bạn bè
```typescript
// Features:
- Search bar
- Filter buttons (3 rows)
- FlatList với FriendCard
- Pull to refresh
- Loading states
- Empty state
- Navigation to friend detail
```

#### 2.3.3. Services

**friend.service.ts**
```typescript
class FriendService {
  async searchFriends(
    request: FriendSearchRequest, 
    token: string
  ): Promise<FriendResponse[]>
  
  async getFriendsList(
    latitude?: number, 
    longitude?: number, 
    token?: string
  ): Promise<FriendResponse[]>
  
  async addFriend(
    request: AddFriendRequest, 
    token: string
  ): Promise<string>
  
  async removeFriend(
    friendId: number, 
    token: string
  ): Promise<string>
}
```

### 2.4. Flow hoạt động

#### 2.4.1. Tìm kiếm và lọc

```
1. User mở Friends Tab
2. App tự động load danh sách bạn bè
   - Gọi GET /api/v1/friends/list
   - Truyền vị trí hiện tại (latitude, longitude)
3. Backend:
   - Lấy danh sách bạn bè từ Friendship table
   - Tính khoảng cách từ user đến từng friend
   - Trả về danh sách đã sort theo khoảng cách
4. User nhập từ khóa tìm kiếm
   - Frontend filter local theo tên/email
5. User chọn filter (Status/Distance/Activity)
   - Frontend gọi POST /api/v1/friends/search
   - Backend filter và trả về kết quả
6. Hiển thị danh sách đã filter
```

### 2.5. Thuật toán tính khoảng cách

**Haversine Formula** - Tính khoảng cách giữa 2 điểm trên mặt cầu

```java
private double calculateDistance(
    double lat1, double lon1, 
    double lat2, double lon2
) {
    final int R = 6371000; // Bán kính Trái Đất (meters)
    
    double latDistance = Math.toRadians(lat2 - lat1);
    double lonDistance = Math.toRadians(lon2 - lon1);
    
    double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(Math.toRadians(lat1)) 
            * Math.cos(Math.toRadians(lat2))
            * Math.sin(lonDistance / 2) 
            * Math.sin(lonDistance / 2);
    
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Khoảng cách tính bằng meters
}
```

### 2.6. API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/friends/search` | Tìm kiếm bạn bè với filters |
| GET | `/api/v1/friends/list` | Lấy danh sách tất cả bạn bè |
| POST | `/api/v1/friends/add` | Thêm bạn mới |
| DELETE | `/api/v1/friends/{id}` | Xóa bạn |

### 2.7. Database Schema

**Table: friendships**
```sql
CREATE TABLE friendships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACCEPTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id),
    UNIQUE KEY unique_friendship (user_id, friend_id)
);
```


---

<a name="tinh-nang-3"></a>
## 3. TÍNH NĂNG XEM CHI TIẾT BẠN BÈ & ĐỊA ĐIỂM

### 3.1. Mô tả tính năng

#### 3.1.1. Chi tiết Bạn bè
- Xem thông tin chi tiết: Avatar, tên, email, phone
- Vị trí hiện tại và khoảng cách
- Trạng thái online/offline và hoạt động
- Lịch sử vị trí 24 giờ gần nhất
- Mini map hiển thị vị trí với polyline trail
- Actions: View on Map, Remove Friend

#### 3.1.2. Chi tiết Địa điểm
- Thông tin: Tên, category, địa chỉ
- Khoảng cách từ vị trí hiện tại
- Rating và đánh giá
- Giờ mở cửa
- Số điện thoại (có thể gọi trực tiếp)
- Mô tả chi tiết
- Map hiển thị vị trí
- Action: Navigate (mở Google Maps)

### 3.2. Kiến trúc Backend

#### 3.2.1. DTOs

**FriendProfileResponse.java**
```java
@Data
public class FriendProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String status;
    private String activityStatus;
    private Double distance;
    private Double latitude;
    private Double longitude;
    private LocalDateTime lastSeen;
    private List<LocationHistoryDto> locationHistory;
}

@Data
class LocationHistoryDto {
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private String status;
}
```

**PlaceResponse.java**
```java
@Data
public class PlaceResponse {
    private Long id;
    private String name;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double distance;
    private Double rating;
    private String phone;
    private String openingHours;
    private String description;
    private String imageUrl;
}
```

#### 3.2.2. Entities

**Place Entity**
```java
@Entity
@Table(name = "places")
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private String phone;
    private String openingHours;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String imageUrl;
}
```

**Location Entity** (Lịch sử vị trí)
```java
@Entity
@Table(name = "locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private Double latitude;
    private Double longitude;
    private String status;
    private LocalDateTime timestamp;
}
```


#### 3.2.3. Services

**FriendService.java**
```java
@Service
public class FriendService {
    
    // Lấy thông tin chi tiết bạn bè
    public FriendProfileResponse getFriendProfile(
        Long userId, 
        Long friendId,
        Double userLat, 
        Double userLon
    ) {
        // 1. Lấy thông tin friend
        // 2. Lấy vị trí hiện tại của friend
        // 3. Tính khoảng cách
        // 4. Lấy lịch sử vị trí 24h
        // 5. Map sang DTO
        return profile;
    }
    
    // Lấy lịch sử vị trí 24h
    private List<LocationHistoryDto> getLocationHistory(
        Long userId, 
        int hours
    ) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Location> locations = locationRepository
            .findByUserAndTimestampAfterOrderByTimestampDesc(
                user, since
            );
        return locations.stream()
            .map(this::mapToLocationHistoryDto)
            .collect(Collectors.toList());
    }
}
```

**PlaceService.java**
```java
@Service
public class PlaceService {
    
    // Tìm kiếm địa điểm
    public List<PlaceResponse> searchPlaces(
        String query,
        String category,
        Double latitude,
        Double longitude,
        Integer radius
    ) {
        // 1. Query database theo tên và category
        // 2. Tính khoảng cách
        // 3. Filter theo radius
        // 4. Sort theo khoảng cách
        return places;
    }
    
    // Lấy chi tiết địa điểm
    public PlaceResponse getPlaceDetail(
        Long placeId,
        Double userLat,
        Double userLon
    ) {
        Place place = placeRepository.findById(placeId)
            .orElseThrow(() -> new NotFoundException("Place not found"));
        
        PlaceResponse response = mapToResponse(place);
        
        if (userLat != null && userLon != null) {
            double distance = calculateDistance(
                userLat, userLon,
                place.getLatitude(), place.getLongitude()
            );
            response.setDistance(distance);
        }
        
        return response;
    }
    
    // Tìm địa điểm gần đây
    public List<PlaceResponse> getNearbyPlaces(
        Double latitude,
        Double longitude,
        Integer radius
    ) {
        // Tìm tất cả địa điểm trong bán kính
        List<Place> allPlaces = placeRepository.findAll();
        
        return allPlaces.stream()
            .map(place -> {
                PlaceResponse response = mapToResponse(place);
                double distance = calculateDistance(
                    latitude, longitude,
                    place.getLatitude(), place.getLongitude()
                );
                response.setDistance(distance);
                return response;
            })
            .filter(p -> p.getDistance() <= radius)
            .sorted(Comparator.comparing(PlaceResponse::getDistance))
            .collect(Collectors.toList());
    }
}
```

#### 3.2.4. Controllers

**FriendController.java**
```java
@GetMapping("/{friendId}/profile")
public ResponseEntity<ApiResponse<FriendProfileResponse>> getFriendProfile(
    @PathVariable Long friendId,
    @RequestParam(required = false) Double latitude,
    @RequestParam(required = false) Double longitude
)
```

**PlaceController.java**
```java
@RestController
@RequestMapping("/api/v1/places")
public class PlaceController {
    
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> searchPlaces(
        @RequestBody PlaceSearchRequest request
    )
    
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<PlaceResponse>>> getNearbyPlaces(
        @RequestParam Double latitude,
        @RequestParam Double longitude,
        @RequestParam(defaultValue = "5000") Integer radius
    )
    
    @GetMapping("/{placeId}")
    public ResponseEntity<ApiResponse<PlaceResponse>> getPlaceDetail(
        @PathVariable Long placeId,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude
    )
}
```

### 3.3. Kiến trúc Frontend

#### 3.3.1. Screens

**friend-detail.screen.tsx**
```typescript
// Features:
- Gradient background (Doraemon Space Theme)
- Avatar lớn với status indicator
- Thông tin: Name, Email, Phone, Status
- Section Location Info với khoảng cách
- MapView hiển thị:
  + Marker của friend (với avatar)
  + Marker của user
  + Polyline trail (lịch sử 24h)
- Location History list (10 điểm gần nhất)
- Action buttons:
  + View on Map (navigate to home tab)
  + Remove Friend (với confirmation)
```

**place-detail.screen.tsx**
```typescript
// Features:
- Gradient background
- Image header (hoặc icon placeholder)
- Thông tin chi tiết:
  + Name & Category
  + Rating badge
  + Distance
  + Address
  + Phone (clickable to call)
  + Opening hours
  + Description
- MapView hiển thị vị trí
- Navigate button (mở Google Maps)
```

#### 3.3.2. Components

**SearchOverlay.tsx** - Overlay tìm kiếm địa điểm
```typescript
// Features:
- Search bar với icon
- Category filters (Restaurant, Cafe, Park, Hospital, Gas Station)
- Glassmorphism design
- Active state cho selected category
```

**PlaceBottomSheet.tsx** - Bottom sheet kết quả
```typescript
// Features:
- Header với số lượng kết quả
- ScrollView danh sách places
- Place item với:
  + Image/Icon
  + Name, category, distance
  + Rating
- Click để xem chi tiết
```

### 3.4. Flow hoạt động

#### 3.4.1. Xem chi tiết bạn bè

```
1. User click vào FriendCard trong danh sách
2. Navigate to friend-detail screen với friendId
3. Screen gọi API:
   GET /api/v1/friends/{friendId}/profile?latitude=...&longitude=...
4. Backend:
   - Lấy thông tin friend
   - Lấy vị trí hiện tại
   - Tính khoảng cách
   - Lấy lịch sử vị trí 24h
5. Hiển thị:
   - Thông tin cơ bản
   - Map với markers và polyline
   - Location history list
6. User có thể:
   - View on Map: Navigate về Home tab, focus vào friend
   - Remove Friend: Hiện confirmation dialog
```

#### 3.4.2. Tìm kiếm và xem chi tiết địa điểm

```
1. User mở Home tab (Map screen)
2. Click vào search icon → Hiện SearchOverlay
3. User nhập từ khóa hoặc chọn category
4. Frontend gọi:
   POST /api/v1/places/search
   {
     query: "coffee",
     category: "cafe",
     latitude: 10.762622,
     longitude: 106.660172,
     radius: 5000
   }
5. Backend:
   - Tìm places theo query và category
   - Tính khoảng cách
   - Filter theo radius
   - Sort theo khoảng cách
6. Hiển thị PlaceBottomSheet với kết quả
7. User click vào place → Navigate to place-detail
8. Screen gọi:
   GET /api/v1/places/{placeId}?latitude=...&longitude=...
9. Hiển thị chi tiết với map
10. User click Navigate → Mở Google Maps
```


### 3.5. API Endpoints

#### Friend Detail APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/friends/{id}/profile` | Lấy thông tin chi tiết bạn bè |
| GET | `/api/v1/friends/{id}/location-history` | Lấy lịch sử vị trí |

#### Place APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/places/search` | Tìm kiếm địa điểm |
| GET | `/api/v1/places/nearby` | Lấy địa điểm gần đây |
| GET | `/api/v1/places/{id}` | Lấy chi tiết địa điểm |

### 3.6. Database Schema

**Table: places**
```sql
CREATE TABLE places (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    address TEXT,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    rating DOUBLE,
    phone VARCHAR(20),
    opening_hours VARCHAR(255),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index cho tìm kiếm
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_name ON places(name);
CREATE INDEX idx_places_location ON places(latitude, longitude);
```

**Table: locations** (Lịch sử vị trí)
```sql
CREATE TABLE locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_timestamp (user_id, timestamp)
);
```

### 3.7. Design System - Doraemon Space Theme

Tất cả các màn hình được thiết kế theo theme nhất quán:

**Colors:**
- Primary: `#3A86FF` (Doraemon Blue)
- Background: `#0B2545` (Deep Space Blue)
- Accent: `#FFD60A` (Yellow Bell)
- Light: `#EEF4ED` (Cloud White)

**Effects:**
- LinearGradient backgrounds
- Glassmorphism cards với `borderRadius`, `borderColor`, `shadows`
- Frosted blue card backgrounds
- Cosmic blend overlays

**Typography:**
- Font sizes từ theme constants
- Font weights: normal, medium, semibold, bold
- Consistent spacing

**Components:**
- Rounded corners (borderRadius.lg, borderRadius.xl)
- Shadows cho depth
- Active opacity cho touch feedback
- Status indicators với theme colors

---

<a name="huong-dan"></a>
## 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### 4.1. Yêu cầu hệ thống

**Backend:**
- Java 17 hoặc cao hơn
- Maven 3.8+
- MySQL 8.0+
- IDE: IntelliJ IDEA hoặc Eclipse

**Frontend:**
- Node.js 18+ và npm
- Expo CLI
- Android Studio (cho Android emulator)
- Điện thoại Android với Expo Go app

### 4.2. Cài đặt Backend

```bash
# 1. Clone repository
git clone [repository-url]
cd MAPIC_App/backend

# 2. Cấu hình database
# Tạo database MySQL
mysql -u root -p
CREATE DATABASE mapic_db;

# 3. Cấu hình application.properties
# File: src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mapic_db
spring.datasource.username=root
spring.datasource.password=your_password

# Email configuration (cho OTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# 4. Build và chạy
mvn clean install
mvn spring-boot:run

# Backend sẽ chạy tại: http://localhost:8080
```

### 4.3. Cài đặt Frontend

```bash
# 1. Di chuyển vào thư mục frontend
cd MAPIC_App/MAPIC_Client

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình IP address
# Chạy script tự động detect IP
npm run update-ip

# Hoặc thủ công: Sửa file .env
EXPO_PUBLIC_API_URL=http://192.168.1.25:8080

# 4. Chạy ứng dụng
npm start

# 5. Chọn platform
# - Press 'a' để chạy trên Android emulator
# - Hoặc scan QR code bằng Expo Go app
```

### 4.4. Seed dữ liệu test

```bash
# Backend có sẵn script seed data
cd MAPIC_App/backend

# Windows
seed-locations.bat

# Linux/Mac
./seed-locations.sh

# Script sẽ tạo:
# - Users mẫu
# - Friendships
# - Locations
# - Places (restaurants, cafes, parks, etc.)
```

### 4.5. Test API với Postman

**Import collection:**
1. Mở Postman
2. Import file: `MAPIC_App/backend/postman_collection.json`
3. Set environment variable: `base_url = http://localhost:8080`

**Test flow:**
```
1. Register user: POST /api/v1/auth/register
2. Login: POST /api/v1/auth/login
   → Lấy token
3. Get profile: GET /api/v1/users/profile
   Header: Authorization: Bearer {token}
4. Search friends: POST /api/v1/friends/search
5. Get friend detail: GET /api/v1/friends/{id}/profile
6. Search places: POST /api/v1/places/search
7. Get place detail: GET /api/v1/places/{id}
```

### 4.6. Troubleshooting

**Lỗi kết nối Backend:**
```
- Kiểm tra Backend đang chạy: http://localhost:8080
- Kiểm tra IP address trong .env file
- Đảm bảo điện thoại và máy tính cùng mạng WiFi
```

**Lỗi OTP không gửi được:**
```
- Kiểm tra email configuration trong application.properties
- Sử dụng App Password của Gmail (không phải password thường)
- Enable "Less secure app access" trong Gmail settings
```

**Lỗi LinearGradient warning:**
```
# Rebuild development client
npx expo prebuild --clean
npx expo run:android
```

---

<a name="ket-luan"></a>
## 5. KẾT LUẬN

### 5.1. Tổng kết

Đã hoàn thành triển khai 3 tính năng chính cho ứng dụng MAPIC:

1. **Quản lý Profile** - Cho phép user cập nhật thông tin cá nhân với xác thực OTP
2. **Tìm kiếm & Lọc Bạn bè** - Tìm kiếm và lọc bạn bè theo nhiều tiêu chí
3. **Xem Chi tiết** - Xem thông tin chi tiết bạn bè và địa điểm với map integration

### 5.2. Công nghệ đã sử dụng

**Backend:**
- Spring Boot 3.x với Spring Security
- JWT Authentication
- MySQL Database
- JavaMail API
- RESTful API design

**Frontend:**
- React Native + Expo
- TypeScript
- React Navigation
- Expo Location & Image Picker
- MapView integration
- Realm Database

### 5.3. Điểm nổi bật

- **Security:** JWT authentication, OTP verification, password hashing
- **UX:** Doraemon Space Theme với glassmorphism effects
- **Performance:** Haversine formula cho tính khoảng cách chính xác
- **Offline:** Realm database cho offline storage
- **Real-time:** Location tracking và updates
- **Scalable:** Clean architecture, separation of concerns

### 5.4. Hướng phát triển

- Thêm real-time chat giữa bạn bè
- Push notifications cho friend requests
- Social features: posts, comments, likes
- Advanced map features: routes, traffic
- Analytics và reporting

---

## PHỤ LỤC

### A. Cấu trúc thư mục Backend

```
backend/
├── src/main/java/com/mapic/backend/
│   ├── config/          # Security, CORS config
│   ├── controllers/     # REST Controllers
│   ├── dtos/           # Data Transfer Objects
│   ├── entities/       # JPA Entities
│   ├── repositories/   # Spring Data JPA
│   ├── services/       # Business Logic
│   └── utils/          # Helper classes
├── src/main/resources/
│   ├── application.properties
│   └── templates/      # Email templates
└── pom.xml
```

### B. Cấu trúc thư mục Frontend

```
MAPIC_Client/
├── app/                # Expo Router screens
│   ├── (tabs)/        # Tab navigation
│   ├── friends/       # Friend routes
│   └── places/        # Place routes
├── components/        # Reusable components
│   ├── friends/
│   └── map/
├── screens/          # Screen components
│   ├── friends/
│   ├── places/
│   └── profile/
├── services/         # API services
├── store/           # State management
├── constants/       # Theme, API constants
└── types/           # TypeScript types
```


