// Universal authenticated API client for PharmaGuard AI

export const APP_NAME = 'PharmaGuard AI';
export const API_VERSION = 'v1.0.0';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const url = endpoint.startsWith('/')
    ? `${API_BASE}${endpoint}`
    : `${API_BASE}/${endpoint}`;

  const config: RequestInit = {
    ...customConfig,
    credentials: 'include', // Automatically transmit and store HttpOnly cookies
    headers: {
      Accept: 'application/json',
      ...(data ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error. Please check your connection.';
    throw new ApiError(errorMsg, 0);
  }

  // Handle Unauthorized (401)
  if (response.status === 401) {
    // Notify application of session expiration
    window.dispatchEvent(
      new CustomEvent('pharmaguard:unauthorized', {
        detail: { message: 'Your session has expired. Please sign in again.' },
      })
    );
  }

  // Parse JSON response body
  let responseData: unknown = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred.';
    if (responseData && typeof responseData === 'object') {
      const dataObj = responseData as Record<string, unknown>;
      if (typeof dataObj.detail === 'string') {
        message = dataObj.detail;
      } else if (Array.isArray(dataObj.detail) && dataObj.detail.length > 0) {
        // Pydantic validation error array
        const firstErr = dataObj.detail[0] as { msg?: string };
        message = firstErr.msg || message;
      } else if (typeof dataObj.message === 'string') {
        message = dataObj.message;
      }
    }
    throw new ApiError(message, response.status);
  }

  return responseData as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', data }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', data }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
