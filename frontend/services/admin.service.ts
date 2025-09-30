import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  policyCount: number;
  bidCount: number;
  pushSuccessRate: number;
  crawlSuccessRate: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string;
  subscription: {
    type: string;
    status: string;
    expireAt: string;
  };
}

export interface NodeStats {
  nodeId: string;
  nodeName: string;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  lastSuccessAt: string;
  lastFailureAt: string;
  status: "healthy" | "warning" | "error";
}

class AdminService {
  private api = axios.create({
    baseURL: `${API_URL}/api/admin`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response = await this.api.get('/users');
    return response.data;
  }

  async getNodeStats(): Promise<NodeStats[]> {
    const response = await this.api.get('/nodes/stats');
    return response.data;
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await this.api.patch(`/users/${userId}/status`, { status });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/users/${userId}`);
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await this.api.patch(`/users/${userId}/role`, { role });
  }

  async getSystemLogs(limit: number = 100): Promise<any[]> {
    const response = await this.api.get(`/logs?limit=${limit}`);
    return response.data;
  }

  async exportData(type: 'users' | 'policies' | 'bids'): Promise<Blob> {
    const response = await this.api.get(`/export/${type}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const adminService = new AdminService();