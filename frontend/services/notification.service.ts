import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  updatedAt: string;
  data?: any;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  wechat: boolean;
  feishu: boolean;
  dingtalk: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class NotificationService {
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

  // 获取通知列表
  async getNotifications(page = 1, pageSize = 20): Promise<PaginatedResponse<Notification>> {
    try {
      const response = await this.api.get('/notifications', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // 返回模拟数据
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  }

  // 获取未读通知数量
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.api.get('/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  // 标记通知为已读
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // 标记所有通知为已读
  async markAllAsRead(): Promise<void> {
    try {
      await this.api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // 删除通知
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await this.api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // 获取通知设置
  async getSettings(): Promise<NotificationSettings> {
    try {
      const response = await this.api.get('/notifications/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      // 返回默认设置
      return {
        email: true,
        push: true,
        sms: false,
        wechat: false,
        feishu: false,
        dingtalk: false,
      };
    }
  }

  // 更新通知设置
  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const response = await this.api.patch('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  // 发送测试通知
  async sendTestNotification(type: keyof NotificationSettings): Promise<void> {
    try {
      await this.api.post('/notifications/test', { type });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  // 订阅推送通知
  async subscribePush(subscription: PushSubscription): Promise<void> {
    try {
      await this.api.post('/notifications/push/subscribe', {
        subscription: subscription.toJSON()
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // 取消订阅推送通知
  async unsubscribePush(): Promise<void> {
    try {
      await this.api.post('/notifications/push/unsubscribe');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();