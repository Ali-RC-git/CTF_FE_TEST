/**
 * Centralized API client for CTF Backend
 * Handles authentication, request/response processing, and error handling
 */

import { HTTP_STATUS, REQUEST_TIMEOUTS, CONTENT_TYPES, REQUEST_HEADERS } from '@/lib/constants/api';
import { processBackendError, getErrorType, getErrorMessageByType, ErrorType, ProcessedError } from '@/lib/utils/error-handler';

// Base configuration from environment variables
// For Next.js API routes, use relative URLs
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
const DEFAULT_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');
const API_LOGGING = process.env.NEXT_PUBLIC_API_LOGGING === 'true';

// Token management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'ctf_access_token';
  private static REFRESH_TOKEN_KEY = 'ctf_refresh_token';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    
    // Also set cookies for middleware access
    document.cookie = `access_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // Also clear cookies
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// API Error class
export class APIError extends Error {
  public processedError: ProcessedError;
  public errorType: ErrorType;

  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.processedError = processBackendError(details);
    this.errorType = getErrorType(details);
  }

  /**
   * Gets field-specific error messages
   */
  getFieldErrors() {
    return this.processedError.fieldErrors;
  }

  /**
   * Gets error message for a specific field
   */
  getFieldError(fieldName: string): string | undefined {
    const fieldError = this.processedError.fieldErrors.find(error => error.field === fieldName);
    return fieldError?.messages[0];
  }

  /**
   * Checks if a specific field has errors
   */
  hasFieldError(fieldName: string): boolean {
    return this.processedError.fieldErrors.some(error => error.field === fieldName);
  }

  /**
   * Gets the general error message
   */
  getGeneralError(): string | undefined {
    return this.processedError.generalError;
  }

  /**
   * Checks if this is a validation error
   */
  isValidationError(): boolean {
    return this.errorType === ErrorType.VALIDATION;
  }
}

// Request configuration interface
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  requireAuth?: boolean;
}

// API Response interface
interface APIResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

class APIClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string = BASE_URL, defaultTimeout: number = DEFAULT_TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Log API request/response for debugging
   */
  private logRequest(method: string, endpoint: string, data?: any) {
    if (API_LOGGING) {
      console.log(`🚀 API Request: ${method} ${endpoint}`, data ? { data } : '');
    }
  }

  private logResponse(method: string, endpoint: string, status: number, data?: any) {
    if (API_LOGGING) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} API Response: ${method} ${endpoint} [${status}]`, data ? { data } : '');
    }
  }

  /**
   * Make an authenticated request with automatic token refresh
   */
  private async makeRequest<T = any>(
    endpoint: string,
    requestConfig: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      requireAuth = true
    } = requestConfig;

    // Log the request
    this.logRequest(method, endpoint, body);

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      [REQUEST_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
      ...headers
    };

    // Add authorization header if required
    if (requireAuth) {
      const token = TokenManager.getAccessToken();
      if (token) {
        requestHeaders[REQUEST_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, requestOptions);
      
      // Log the response
      this.logResponse(method, endpoint, response.status);
      
      // Handle token refresh for 401 errors
      if (response.status === HTTP_STATUS.UNAUTHORIZED && requireAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = TokenManager.getAccessToken();
          if (newToken) {
            requestHeaders[REQUEST_HEADERS.AUTHORIZATION] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
              ...requestOptions,
              headers: requestHeaders
            });
            return this.handleResponse<T>(retryResponse);
          }
        }
        // If refresh failed, clear tokens and throw error
        TokenManager.clearTokens();
        throw new APIError('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new APIError('Request timeout', 408);
        }
        throw new APIError(error.message, 0);
      }
      throw new APIError('Unknown error occurred', 0);
    }
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    let data: T;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }
    } catch (error) {
      data = {} as T;
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (typeof data === 'object' && data) {
        // Try to extract error message from different possible fields
        if ('message' in data) {
          errorMessage = (data as any).message;
        } else if ('detail' in data) {
          errorMessage = (data as any).detail;
        } else if ('error' in data) {
          errorMessage = (data as any).error;
        }
      }
      
      throw new APIError(
        errorMessage,
        response.status,
        typeof data === 'object' && data && 'code' in data ? (data as any).code : undefined,
        data
      );
    }

    return {
      data,
      status: response.status,
      headers: response.headers
    };
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<boolean> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          [REQUEST_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON
        },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.access, refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Public API methods

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'GET', requireAuth });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, requireAuth: boolean = true, options?: { timeout?: number }): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'POST', body, requireAuth, timeout: options?.timeout });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'PUT', body, requireAuth });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'PATCH', body, requireAuth });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest<T>(endpoint, { method: 'DELETE', requireAuth });
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  /**
   * Clear authentication tokens
   */
  logout(): void {
    TokenManager.clearTokens();
  }
}

// Create and export singleton instance
export const apiClient = new APIClient();

// Export token manager for direct access if needed
export { TokenManager };
