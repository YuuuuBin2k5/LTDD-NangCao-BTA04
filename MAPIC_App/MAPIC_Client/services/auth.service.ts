import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api.service';
import { API_ENDPOINTS } from '../constants/api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ActivateRequest,
  EmailRequest
} from '../types/auth.types';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'userData';

class AuthService {
  // Đăng ký
  async register(data: RegisterRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(
      API_ENDPOINTS.REGISTER,
      data
    );
    return response;
  }

  // Đăng nhập
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      data
    );

    // Lưu token và user info
    if (response.status === 'success' && response.data) {
      await this.saveToken(response.data.accessToken);
      await this.saveUser(response.data.user);
    }

    return response;
  }

  // Đăng xuất
  async logout(token?: string): Promise<void> {
    // Thử logout với API nếu có token
    if (token) {
      try {
        await apiService.post(API_ENDPOINTS.LOGOUT, {}, token);
      } catch (error) {
        console.error('Logout API error:', error);
        // Không throw error, vẫn clear local data
      }
    }
    // Luôn clear local data
    await this.clearAuth();
  }

  // Lưu token
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  // Lấy token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  // Lưu user info
  async saveUser(user: any): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Lấy user info
  async getUser(): Promise<any | null> {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Xóa auth data
  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }

  // Kiểm tra đã đăng nhập chưa
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Quên mật khẩu - Gửi OTP
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(
      API_ENDPOINTS.FORGOT_PASSWORD,
      data
    );
    return response;
  }

  // Xác thực OTP
  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(
      API_ENDPOINTS.VERIFY_OTP,
      data
    );
    return response;
  }

  // Đặt lại mật khẩu
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(
      API_ENDPOINTS.RESET_PASSWORD,
      data
    );
    return response;
  }

  // Kích hoạt tài khoản
  async activateAccount(data: ActivateRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(
      API_ENDPOINTS.ACTIVATE,
      data
    );
    return response;
  }

  // Gửi lại OTP kích hoạt
  async resendActivationOtp(data: EmailRequest): Promise<ApiResponse> {
    const response = await apiService.post<ApiResponse>(
      API_ENDPOINTS.RESEND_ACTIVATION,
      data
    );
    return response;
  }
}

export default new AuthService();
