import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';

export interface LoginCredentials {
  username: string; // Email
  password: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface SuperAdminProfile {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export const authService = {
  /**
   * Super Admin Login via OAuth2 Form URL-encoded data
   */
  async loginSuperAdmin(credentials: LoginCredentials): Promise<AuthTokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<AuthTokenResponse>(
      ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('hazree_auth_token', response.access_token);
    }

    return response;
  },

  /**
   * Get currently logged-in Super Admin profile
   */
  async getSuperAdminProfile(): Promise<SuperAdminProfile> {
    return apiClient.get<SuperAdminProfile>(ENDPOINTS.AUTH.SUPER_ADMIN_ME);
  },

  /**
   * Logout Super Admin
   */
  async logoutSuperAdmin(): Promise<{ message: string }> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hazree_auth_token');
    }
    return apiClient.post<{ message: string }>(ENDPOINTS.AUTH.SUPER_ADMIN_LOGOUT);
  },

  /**
   * Check PostgreSQL connection status
   */
  async getDbStatus(): Promise<any> {
    return apiClient.get(ENDPOINTS.AUTH.DB_STATUS);
  },

  /**
   * Check if token is available
   */
  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hazree_auth_token');
    }
    return null;
  },

  /**
   * Remove stored token
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hazree_auth_token');
    }
  },
};
