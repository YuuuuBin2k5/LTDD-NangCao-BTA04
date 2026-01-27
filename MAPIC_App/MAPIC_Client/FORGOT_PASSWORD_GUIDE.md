# Hướng dẫn sử dụng chức năng Quên Mật Khẩu

## Tổng quan
Chức năng quên mật khẩu cho phép người dùng đặt lại mật khẩu thông qua email OTP.

## Luồng hoạt động

### 1. Màn hình Quên Mật Khẩu (`forgot-password.tsx`)
- Người dùng nhập email
- Hệ thống gửi mã OTP (6 chữ số) đến email
- Chuyển sang màn hình Đặt lại mật khẩu

### 2. Màn hình Đặt lại Mật Khẩu (`reset-password.tsx`)
- Người dùng nhập:
  - Mã OTP (6 chữ số)
  - Mật khẩu mới (tối thiểu 6 ký tự)
  - Xác nhận mật khẩu mới
- Có nút "Gửi lại" để nhận OTP mới nếu cần
- Sau khi thành công, chuyển về màn hình đăng nhập

## API Endpoints

### Backend (Spring Boot)
```
POST /api/v1/auth/forgot-password
Body: { "email": "user@example.com" }
Response: { "status": "success", "message": "Mã OTP đã được gửi..." }

POST /api/v1/auth/verify-otp (Optional)
Body: { "email": "user@example.com", "otp": "123456" }
Response: { "status": "success", "message": "Mã OTP hợp lệ" }

POST /api/v1/auth/reset-password
Body: { 
  "email": "user@example.com", 
  "otp": "123456",
  "newPassword": "newpass123"
}
Response: { "status": "success", "message": "Mật khẩu đã được đặt lại thành công!" }
```

## Cấu trúc File

### Frontend (React Native)
```
app/(auth)/
├── login.tsx              # Có link "Quên mật khẩu?"
├── forgot-password.tsx    # Nhập email, gửi OTP
└── reset-password.tsx     # Nhập OTP và mật khẩu mới

services/
└── auth.service.ts        # Có methods: forgotPassword, verifyOtp, resetPassword

types/
└── auth.types.ts          # Có interfaces: ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest

constants/
└── api.ts                 # Có endpoints: FORGOT_PASSWORD, VERIFY_OTP, RESET_PASSWORD
```

### Backend (Spring Boot)
```
controllers/
└── AuthController.java    # Endpoints: /forgot-password, /verify-otp, /reset-password

services/
├── AuthService.java       # Logic xử lý forgot password
├── OtpService.java        # Generate và verify OTP
└── EmailService.java      # Gửi email OTP

dtos/
├── EmailRequest.java      # { email }
├── VerifyOtpRequest.java  # { email, otp }
├── ResetPasswordRequest.java  # { email, otp, newPassword }
└── ApiResponse.java       # Wrapper response chuẩn
```

## Validation

### Frontend
- Email phải hợp lệ (regex)
- OTP phải có 6 chữ số
- Mật khẩu mới tối thiểu 6 ký tự
- Mật khẩu xác nhận phải khớp

### Backend
- Email phải tồn tại trong hệ thống
- Tài khoản phải đã được kích hoạt
- OTP phải hợp lệ và chưa hết hạn (thường 5-10 phút)

## Bảo mật
- OTP có thời gian hết hạn
- Mật khẩu được mã hóa bằng BCrypt
- Rate limiting để tránh spam OTP
- CORS được cấu hình cho phép frontend

## Testing

### Test Frontend
1. Mở app và đi đến màn hình đăng nhập
2. Click "Quên mật khẩu?"
3. Nhập email đã đăng ký
4. Kiểm tra email để lấy OTP
5. Nhập OTP và mật khẩu mới
6. Đăng nhập với mật khẩu mới

### Test Backend
```bash
# Gửi OTP
curl -X POST http://localhost:8080/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Verify OTP
curl -X POST http://localhost:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# Reset Password
curl -X POST http://localhost:8080/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","newPassword":"newpass123"}'
```

## Lưu ý
- Đảm bảo EmailService đã được cấu hình đúng (SMTP settings)
- Kiểm tra OtpService có sử dụng đúng OtpType.FORGOT_PASSWORD
- Frontend cần cập nhật API_CONFIG.BASE_URL cho đúng với IP backend
- OTP được lưu trong database với thời gian hết hạn
