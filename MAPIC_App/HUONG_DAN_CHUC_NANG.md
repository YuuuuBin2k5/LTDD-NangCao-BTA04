# HƯỚNG DẪN CÁC CHỨC NĂNG XÁC THỰC - MAPIC APP

**Sinh viên:** Đào Nguyễn Nhật Anh  
**Ngày:** 27/01/2026  
**Môn:** Lập trình di động nâng cao

---

## MỤC LỤC

1. Tổng quan hệ thống
2. Chức năng Đăng ký với OTP
3. Chức năng Đăng nhập với JWT
4. Chức năng Quên mật khẩu với OTP
5. Cấu trúc dự án
6. Hướng dẫn cài đặt và chạy

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Công nghệ sử dụng

**Frontend (Mobile App):**
- React Native với Expo
- TypeScript
- React Navigation (Expo Router)
- AsyncStorage (lưu trữ token)

**Backend (API Server):**
- Spring Boot 3.4.1
- Spring Security
- JWT (JSON Web Token)
- MySQL Database
- Maven

### 1.2. Các chức năng đã triển khai

- Đăng ký tài khoản với OTP Activation
- Kích hoạt tài khoản qua OTP
- Đăng nhập với JWT Token
- Quên mật khẩu với OTP (2 bước)
- Đặt lại mật khẩu
- Rate limiting (giới hạn gửi OTP)

---

## 2. CHỨC NĂNG ĐĂNG KÝ VỚI OTP

### 2.1. Mô tả chức năng

Người dùng đăng ký tài khoản mới với email, mật khẩu và họ tên. Sau khi đăng ký thành công, hệ thống gửi mã OTP 6 chữ số đến email để kích hoạt tài khoản.

### 2.2. Luồng hoạt động

1. User nhập thông tin đăng ký (email, password, fullName)
2. Backend kiểm tra email đã tồn tại chưa
3. Tạo tài khoản mới với trạng thái active = false
4. Tạo OTP 6 chữ số (hết hạn sau 5 phút)
5. Hiển thị OTP trong console backend
6. User nhập OTP trên màn hình Activate
7. Backend verify OTP
8. Kích hoạt tài khoản (active = true)
9. Chuyển đến màn hình Login

### 2.3. API Endpoints

**2.3.1. Đăng ký tài khoản**

Endpoint: POST /api/v1/auth/register

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A"
}
```

Response Success:
```json
{
  "status": "success",
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.",
  "data": null
}
```

Response Error (Email đã tồn tại):
```json
{
  "status": "error",
  "message": "Email đã tồn tại!",
  "data": null
}
```

**2.3.2. Kích hoạt tài khoản**

Endpoint: POST /api/v1/auth/activate

Request Body:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response Success:
```json
{
  "status": "success",
  "message": "Tài khoản đã được kích hoạt thành công!",
  "data": null
}
```

**2.3.3. Gửi lại OTP kích hoạt**

Endpoint: POST /api/v1/auth/resend-activation

Request Body:
```json
{
  "email": "user@example.com"
}
```

### 2.4. Database Schema

**Bảng users:**
- id: BIGINT (Primary Key)
- email: VARCHAR(255) UNIQUE
- password: VARCHAR(255) (mã hóa BCrypt)
- full_name: VARCHAR(255)
- is_active: BOOLEAN (default: false)
- created_at: TIMESTAMP

**Bảng otp_codes:**
- id: BIGINT (Primary Key)
- user_email: VARCHAR(255)
- otp_code: VARCHAR(6)
- otp_type: VARCHAR(50) (REGISTER, FORGOT_PASSWORD)
- is_used: BOOLEAN (default: false)
- expires_at: TIMESTAMP
- created_at: TIMESTAMP

---

## 3. CHỨC NĂNG ĐĂNG NHẬP VỚI JWT

### 3.1. Mô tả chức năng

Người dùng đăng nhập bằng email và mật khẩu. Sau khi xác thực thành công, backend trả về JWT token để sử dụng cho các request tiếp theo.

### 3.2. Luồng hoạt động

1. User nhập email và password
2. Backend kiểm tra email tồn tại
3. Kiểm tra password đúng (so sánh BCrypt)
4. Kiểm tra tài khoản đã kích hoạt
5. Tạo JWT Token (expires sau 24 giờ)
6. Trả về token + thông tin user
7. Frontend lưu token vào AsyncStorage
8. Chuyển đến màn hình chính

### 3.3. API Endpoint

Endpoint: POST /api/v1/auth/login

Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response Success:
```json
{
  "status": "success",
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "active": true
    }
  }
}
```

Response Error (Sai mật khẩu):
```json
{
  "status": "error",
  "message": "Sai email hoặc mật khẩu!",
  "data": null
}
```

Response Error (Chưa kích hoạt):
```json
{
  "status": "error",
  "message": "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email!",
  "data": null
}
```

### 3.4. JWT Token Structure

**Payload:**
```json
{
  "sub": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "userId": 1,
  "iat": 1706342400,
  "exp": 1706428800
}
```

Token expires sau 24 giờ (86400000 milliseconds)

---

## 4. CHỨC NĂNG QUÊN MẬT KHẨU VỚI OTP

### 4.1. Mô tả chức năng

Người dùng quên mật khẩu có thể đặt lại mật khẩu mới thông qua xác thực OTP 2 bước:
- Bước 1: Nhập email → Nhận OTP → Xác thực OTP
- Bước 2: Nhập mật khẩu mới → Đặt lại mật khẩu

### 4.2. Luồng hoạt động chi tiết

**Màn hình Forgot Password:**
1. User nhập email
2. Click "Gửi mã xác thực"
3. Backend kiểm tra email tồn tại và đã kích hoạt
4. Tạo OTP (6 chữ số, hết hạn sau 5 phút)
5. Hiển thị OTP trong console
6. Nếu thành công: Hiển thị Alert → Click "Tiếp tục" → Chuyển sang màn hình Reset Password
7. Nếu thất bại (rate limit, email không tồn tại): Hiển thị lỗi → Ở lại màn hình

**Màn hình Reset Password - Bước 1:**
1. User nhập OTP 6 chữ số
2. Click "Xác thực"
3. Backend verify OTP (KHÔNG đánh dấu đã sử dụng)
4. Nếu OTP hợp lệ: Hiển thị Alert thành công → Chuyển sang Bước 2
5. Nếu OTP không hợp lệ: Hiển thị lỗi → Xóa OTP → Ở lại Bước 1

**Màn hình Reset Password - Bước 2:**
1. User nhập mật khẩu mới và xác nhận mật khẩu
2. Click "Đặt lại mật khẩu"
3. Backend verify OTP lần nữa (đánh dấu đã sử dụng)
4. Cập nhật mật khẩu mới (mã hóa BCrypt)
5. Hiển thị thành công → Chuyển đến màn hình Login

### 4.3. API Endpoints

**4.3.1. Gửi OTP quên mật khẩu**

Endpoint: POST /api/v1/auth/forgot-password

Request Body:
```json
{
  "email": "user@example.com"
}
```

Response Success:
```json
{
  "status": "success",
  "message": "OTP đã được tạo và hiển thị trong console",
  "data": null
}
```

Response Error (Rate limit):
```json
{
  "status": "error",
  "message": "Không thể gửi mã OTP: Đã vượt quá giới hạn gửi OTP. Vui lòng thử lại sau 1 giờ.",
  "data": null
}
```

**4.3.2. Xác thực OTP (Bước 1)**

Endpoint: POST /api/v1/auth/verify-otp

Request Body:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Response Success:
```json
{
  "status": "success",
  "message": "Mã OTP hợp lệ",
  "data": null
}
```

**4.3.3. Đặt lại mật khẩu (Bước 2)**

Endpoint: POST /api/v1/auth/reset-password

Request Body:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

Response Success:
```json
{
  "status": "success",
  "message": "Mật khẩu đã được đặt lại thành công!",
  "data": null
}
```

### 4.4. Rate Limiting

Để tránh spam OTP, hệ thống giới hạn:
- Tối đa 5 OTP trong vòng 1 giờ cho mỗi email
- OTP hết hạn sau 5 phút
- OTP chỉ sử dụng được 1 lần

### 4.5. OTP Verification Logic

**Điểm quan trọng:** 
- Endpoint /verify-otp chỉ CHECK OTP mà KHÔNG đánh dấu đã sử dụng
- Endpoint /reset-password sẽ verify OTP và đánh dấu đã sử dụng
- Điều này cho phép user có thể quay lại Bước 1 nếu cần

---

## 5. CẤU TRÚC DỰ ÁN

### 5.1. Frontend Structure

```
MAPIC_Client/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── activate.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/
│   ├── index.tsx
│   └── _layout.tsx
├── services/
│   ├── api.service.ts
│   └── auth.service.ts
├── types/
│   └── auth.types.ts
├── constants/
│   └── api.ts
└── package.json
```

### 5.2. Backend Structure

```
backend/
├── src/main/java/com/mapic/backend/
│   ├── controllers/
│   │   └── AuthController.java
│   ├── services/
│   │   ├── AuthService.java
│   │   └── OtpService.java
│   ├── repositories/
│   │   ├── UserRepository.java
│   │   └── OtpRepository.java
│   ├── entities/
│   │   ├── User.java
│   │   └── OtpCode.java
│   ├── dtos/
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── utils/
│   │   └── JwtUtil.java
│   └── enums/
│       └── OtpType.java
└── pom.xml
```

---

## 6. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY

### 6.1. Yêu cầu hệ thống

- Node.js v18 trở lên
- Java JDK 17
- Maven 3.8+
- MySQL 8.0+
- Android Device/Emulator hoặc iOS Simulator

### 6.2. Cài đặt Backend

```bash
# 1. Di chuyển vào thư mục backend
cd MAPIC_App/backend

# 2. Cấu hình database trong application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/mapic_db
# spring.datasource.username=root
# spring.datasource.password=your_password

# 3. Chạy backend
mvn spring-boot:run

# Backend sẽ chạy tại: http://localhost:8080
```

### 6.3. Cài đặt Frontend

```bash
# 1. Di chuyển vào thư mục frontend
cd MAPIC_App/MAPIC_Client

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình API URL trong constants/api.ts
# Nếu test trên thiết bị thật (cùng WiFi):
# BASE_URL: 'http://192.168.1.5:8080/api/v1'

# 4. Chạy app
npx expo start

# 5. Quét QR code bằng Expo Go app trên điện thoại
```

### 6.4. Test trên thiết bị thật

**Bước 1:** Kiểm tra IP máy tính (chạy backend)
```bash
# Windows
ipconfig
# Tìm IPv4 Address của WiFi adapter
# Ví dụ: 192.168.1.5
```

**Bước 2:** Cập nhật API URL trong constants/api.ts
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.5:8080/api/v1',
  TIMEOUT: 10000,
};
```

**Bước 3:** Đảm bảo điện thoại và máy tính cùng mạng WiFi

**Bước 4:** Restart Expo và test

### 6.5. Xem OTP trong Console

Vì chưa cấu hình email service, OTP sẽ hiển thị trong console của backend:

```
=== OTP GENERATED ===
Email: user@example.com
OTP Code: 123456
Type: REGISTER
Expires: 2026-01-27T11:05:00
====================
```

---

## 7. GIAO DIỆN ỨNG DỤNG

### 7.1. Phong cách thiết kế

**Japanese Minimalist Style:**
- Màu sắc: Trắng (#FAFAFA), Đen (#2C2C2C), Đỏ accent (#E63946)
- Font: Light weight (300), letter-spacing rộng
- Input: Chỉ có border dưới (bottom border only)
- Button: Vuông góc (borderRadius: 4)
- Layout: Nhiều khoảng trắng, tối giản
- Decorative: Hình tròn mờ làm điểm nhấn

### 7.2. Màn hình chính

1. Login Screen - Đăng nhập
2. Register Screen - Đăng ký tài khoản
3. Activate Screen - Kích hoạt OTP
4. Forgot Password Screen - Nhập email quên mật khẩu
5. Reset Password Screen - Xác thực OTP và đặt lại mật khẩu (2 bước)

---

## 8. CÁC TÍNH NĂNG BẢO MẬT

### 8.1. Mã hóa mật khẩu

- Sử dụng BCrypt để mã hóa mật khẩu
- Không lưu mật khẩu dạng plain text
- Salt tự động được tạo bởi BCrypt

### 8.2. JWT Token

- Token expires sau 24 giờ
- Signed bằng HS256 algorithm
- Secret key được cấu hình trong application.properties

### 8.3. OTP Security

- OTP 6 chữ số ngẫu nhiên
- Hết hạn sau 5 phút
- Chỉ sử dụng được 1 lần
- Rate limiting: Tối đa 5 OTP/giờ

### 8.4. Spring Security

- CSRF disabled (vì sử dụng JWT)
- Stateless session management
- Public endpoints: /api/v1/auth/**
- Protected endpoints: Yêu cầu JWT token

---

## 9. XỬ LÝ LỖI

### 9.1. Frontend Error Handling

- Validation input trước khi gửi request
- Hiển thị Alert với icon đẹp (✓ thành công, ✕ lỗi)
- Loading states khi đang xử lý
- Không chuyển trang khi có lỗi

### 9.2. Backend Error Handling

- Try-catch blocks trong controllers
- Trả về HTTP status code phù hợp (200, 400, 401, 500)
- Message lỗi rõ ràng bằng tiếng Việt
- Log errors trong console

---

## 10. KẾT LUẬN

Dự án đã hoàn thành đầy đủ các yêu cầu:

- Đăng ký với OTP Activation
- Đăng nhập với JWT Token
- Quên mật khẩu với OTP (2 bước)
- Rate limiting và bảo mật
- Giao diện đẹp, UX tốt
- Error handling đầy đủ

### Các điểm nổi bật:

1. Bảo mật: Mật khẩu được mã hóa bằng BCrypt, JWT token có thời gian hết hạn
2. UX tốt: Thông báo lỗi rõ ràng, loading states, validation đầy đủ
3. Rate limiting: Tránh spam OTP
4. 2-step OTP verification: Tăng tính bảo mật cho forgot password
5. Clean code: Cấu trúc rõ ràng, dễ maintain

---

**Ngày hoàn thành:** 27/01/2026  
**Sinh viên thực hiện:** Đào Nguyễn Nhật Anh
