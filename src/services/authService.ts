import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';

export interface LoginCredentials {
  username?: string; // Email
  email?: string;
  password: string;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  user?: {
    id: number;
    email: string;
    full_name?: string;
    is_super_admin: boolean;
    is_active: boolean;
    created_at?: string;
  };
}

export interface AuthResponse {
  status: string;
  message: string;
  data: AuthData;
}

export interface RefreshResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
    refresh_token?: string;
  };
}

export interface SuperAdminProfile {
  id: number;
  email: string;
  full_name?: string;
  is_super_admin: boolean;
  is_active: boolean;
  created_at?: string;
}

export const authService = {
  /**
   * Super Admin Login:
   * Returns standard { status, message, data: { access_token, refresh_token, user } }
   * and sets 15-Minute Access Token + 7-Day Refresh Token in HTTP-Only browser cookies.
   */
  async loginSuperAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
    const payload = {
      email: credentials.email || credentials.username,
      password: credentials.password,
    };

    return apiClient.post<AuthResponse>(ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN, payload);
  },

  /**
   * Refresh 15-Minute Access Token using HTTP-Only Refresh Cookie
   */
  async refreshSession(): Promise<RefreshResponse> {
    return apiClient.post<RefreshResponse>(ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN.replace('/login', '/refresh'));
  },

  /**
   * Get currently logged-in Super Admin profile from HTTP-Only cookie session
   */
  async getSuperAdminProfile(): Promise<SuperAdminProfile> {
    return apiClient.get<SuperAdminProfile>(ENDPOINTS.AUTH.SUPER_ADMIN_ME);
  },

  /**
   * Logout Super Admin: Clears all HTTP-Only session cookies
   */
  async logoutSuperAdmin(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.SUPER_ADMIN_LOGOUT);
  },

  /**
   * Check PostgreSQL connection status
   */
  async getDbStatus(): Promise<any> {
    return apiClient.get(ENDPOINTS.AUTH.DB_STATUS);
  },
};
