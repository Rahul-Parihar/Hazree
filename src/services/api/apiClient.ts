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
  _retry?: boolean;
}

/**
 * Universal Type-Safe API Client for Hazree Admin
 * - Configured with credentials: 'include' for secure HTTP-Only cookie authentication
 * - Automatic 15-minute access token refresh on 401 Unauthorized
 */
class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<() => void> = [];

  constructor() {
    this.baseUrl = ENV.API_URL.replace(/\/$/, '');
    this.defaultTimeout = ENV.API_TIMEOUT;
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

  private onRefreshed() {
    this.refreshSubscribers.forEach((callback) => callback());
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: () => void) {
    this.refreshSubscribers.push(callback);
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = this.defaultTimeout,
      _retry = false,
      ...customConfig
    } = options;

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeout);

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const isUrlEncoded = typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams;

    const requestHeaders: HeadersInit = {
      ...(isFormData || isUrlEncoded ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    };

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include', // Automatically send & receive HTTP-Only session cookies
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

      // Handle 401 Unauthorized: Auto-refresh 15-minute access token if possible
      if (response.status === 401 && !_retry && !endpoint.includes('/login') && !endpoint.includes('/refresh')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            // Attempt to refresh access token using 7-day HTTP-Only refresh cookie
            await this.request('/super-admin/refresh', { method: 'POST', _retry: true });
            this.isRefreshing = false;
            this.onRefreshed();
            // Retry original request with newly set access token cookie
            return this.request<T>(endpoint, { ...options, _retry: true });
          } catch (refreshErr) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            throw new ApiError('Session expired. Please log in again.', 401);
          }
        } else {
          // If already refreshing, queue this request to retry after refresh completes
          return new Promise<T>((resolve, reject) => {
            this.addRefreshSubscriber(async () => {
              try {
                const res = await this.request<T>(endpoint, { ...options, _retry: true });
                resolve(res);
              } catch (err) {
                reject(err);
              }
            });
          });
        }
      }

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
