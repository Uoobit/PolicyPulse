export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  subscription: {
    type: 'policy' | 'bid' | 'all';
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    expire_at?: string;
    trial_end?: string;
  };
  preferences: {
    keywords: string[];
    regions: string[];
    industries: string[];
    signal_types: string[];
    conservative: boolean;
  };
  notifications: {
    wechat?: string;
    feishu?: string;
    dingding?: string;
    email?: string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  verification_code: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
  verification_code: string;
  new_password: string;
}

export interface VerificationData {
  email: string;
  code: string;
  purpose: 'register' | 'reset_password';
}