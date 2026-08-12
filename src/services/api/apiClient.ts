import { ENV } from '../../config/env';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeout?: number;
  token?: string;
}

/**
 * Universal Type-Safe API Client for Hazree Admin
 */
class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = ENV.API_URL.replace(/\/$/, '');
    this.defaultTimeout = ENV.API_TIMEOUT;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hazree_auth_token');
    }
    return null;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = this.defaultTimeout,
      token,
      ...customConfig
    } = options;

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);

    const authToken = token || this.getToken();

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const isUrlEncoded = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;

    const requestHeaders: HeadersInit = {
      ...(isFormData || isUrlEncoded ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    };

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      ...customConfig,
    };

    if (body !== undefined && body !== null) {
      if (isFormData || isUrlEncoded) {
        config.body = body;
      } else if (typeof body === 'string') {
        config.body = body;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    try {
      const fullUrl = this.buildUrl(endpoint, params);
      const response = await fetch(fullUrl, config);
      clearTimeout(timerId);

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      const contentType = response.headers.get('content-type');
      let data: any;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          (data && typeof data === 'object' && (data.detail || data.message || data.error)) ||
          response.statusText ||
          'API Request Failed';
        throw new ApiError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timerId);
      if (error.name === 'AbortError') {
        throw new ApiError(`Request timeout after ${timeout}ms`, 408);
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(error?.message || 'Network connection failed', 500, error);
    }
  }

  // Convenience methods
  public get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  public delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
