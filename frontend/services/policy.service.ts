import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PolicyItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  region: string;
  industry: string;
  publishDate: string;
  category: string;
  level: string;
  riskLevel: string;
  signals: string[];
  confidence: number;
  url: string;
  tags: string[];
}

export interface BidItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  region: string;
  industry: string;
  publishDate: string;
  category: string;
  budget: string;
  deadline: string;
  opportunity: string;
  url: string;
  tags: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  keywords?: string[];
  regions?: string[];
  industries?: string[];
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

class PolicyService {
  private api = axios.create({
    baseURL: `${API_URL}/api`,
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
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 获取政策列表
  async getPolicies(params: QueryParams = {}): Promise<PaginatedResponse<PolicyItem>> {
    try {
      const response = await this.api.get('/policies', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch policies:', error);
      // 返回模拟数据
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: 0,
      };
    }
  }

  // 获取招标列表
  async getBids(params: QueryParams = {}): Promise<PaginatedResponse<BidItem>> {
    try {
      const response = await this.api.get('/bids', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bids:', error);
      // 返回模拟数据
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: 0,
      };
    }
  }

  // 获取政策详情
  async getPolicyById(id: string): Promise<PolicyItem | null> {
    try {
      const response = await this.api.get(`/policies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch policy:', error);
      return null;
    }
  }

  // 获取招标详情
  async getBidById(id: string): Promise<BidItem | null> {
    try {
      const response = await this.api.get(`/bids/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bid:', error);
      return null;
    }
  }

  // 搜索政策
  async searchPolicies(query: string, params: QueryParams = {}): Promise<PaginatedResponse<PolicyItem>> {
    try {
      const response = await this.api.get('/policies/search', {
        params: { ...params, q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search policies:', error);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: 0,
      };
    }
  }

  // 搜索招标
  async searchBids(query: string, params: QueryParams = {}): Promise<PaginatedResponse<BidItem>> {
    try {
      const response = await this.api.get('/bids/search', {
        params: { ...params, q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to search bids:', error);
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: 0,
      };
    }
  }
}

export const policyService = new PolicyService();