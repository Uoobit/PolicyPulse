import axios from 'axios';
import { User, LoginResponse, RegisterData } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AuthService {
  private api = axios.create({
    baseURL: `${API_URL}/api/auth`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { access_token } = response.data;
              
              localStorage.setItem('access_token', access_token);
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post('/login', { email, password });
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    return { access_token, refresh_token, user };
  }

  async register(userData: RegisterData): Promise<void> {
    await this.api.post('/register', userData);
  }

  async logout(): Promise<void> {
    await this.api.post('/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/me');
    return response.data.user;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return this.api.post('/refresh', { refresh_token: refreshToken });
  }

  async sendVerificationCode(email: string, purpose: 'register' | 'reset_password'): Promise<void> {
    await this.api.post('/send-code', { email, purpose });
  }

  async verifyCode(email: string, code: string): Promise<void> {
    await this.api.post('/verify-code', { email, code });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await this.api.post('/reset-password', {
      email,
      verification_code: code,
      new_password: newPassword,
    });
  }
}

export const authService = new AuthService();