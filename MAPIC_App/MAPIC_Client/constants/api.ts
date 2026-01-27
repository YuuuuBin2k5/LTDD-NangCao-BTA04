// API Configuration
// QUAN TRỌNG: Chọn đúng BASE_URL theo môi trường test

// ✅ ĐANG SỬ DỤNG: Test trên thiết bị thật (cùng WiFi)
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.5:8080/api/v1', // IP WiFi của máy chạy backend
  TIMEOUT: 10000,
};

// Option 2: Test trên Android Emulator
// export const API_CONFIG = {
//   BASE_URL: 'http://10.0.2.2:8080/api/v1',
//   TIMEOUT: 10000,
// };

// Option 3: Test trên iOS Simulator
// export const API_CONFIG = {
//   BASE_URL: 'http://localhost:8080/api/v1',
//   TIMEOUT: 10000,
// };

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ACTIVATE: '/auth/activate',
  RESEND_ACTIVATION: '/auth/resend-activation',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_OTP: '/auth/verify-otp',
  RESET_PASSWORD: '/auth/reset-password',
  
  // User endpoints
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
};
