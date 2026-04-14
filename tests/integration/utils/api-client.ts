/**
 * API测试客户端
 * 封装HTTP请求，用于集成测试
 */

import request from 'supertest';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 设置认证token
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * 清除认证token
   */
  clearToken() {
    this.token = null;
  }

  /**
   * 获取请求头
   */
  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * GET请求
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST请求
   */
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT请求
   */
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  /**
   * OPTIONS请求
   */
  async options<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'OPTIONS',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }

  /**
   * HEAD请求
   */
  async head<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'HEAD',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }

  /**
   * GET请求（带自定义headers）
   */
  async getWithHeaders<T = any>(endpoint: string, customHeaders?: Record<string, string>): Promise<ApiResponse<T>> {
    const headers = { ...this.getHeaders(), ...customHeaders };
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: headers
    });

    return this.handleResponse<T>(response);
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return {
        code: data.code || response.status,
        message: data.message || '',
        data: data.data || data,
        success: data.success || response.ok
      };
    }

    const text = await response.text();
    return {
      code: response.status,
      message: text,
      data: text as any,
      success: response.ok
    };
  }
}

// 创建默认API客户端实例
export const createApiClient = (baseUrl?: string) => {
  return new ApiClient(baseUrl || global.TEST_CONFIG?.apiBaseUrl || 'http://localhost:8080/api');
};

export default ApiClient;
