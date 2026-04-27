/**
 * HTTP客户端工具
 * 低耦合设计：独立的HTTP请求处理，可被任何服务复用
 */

import { ApiConfig, ApiResponse } from '../types';

export class HttpClient {
  private config: ApiConfig;
  private defaultToken?: string;

  constructor(config: ApiConfig, defaultToken?: string) {
    this.config = config;
    this.defaultToken = defaultToken;
  }

  setToken(token: string): void {
    this.defaultToken = token;
  }

  clearToken(): void {
    this.defaultToken = undefined;
  }

  async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    token?: string
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const authToken = token || this.defaultToken;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    let lastError: Error | null = null;

    // 重试机制
    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        options.signal = controller.signal;
        const response = await fetch(url, options);
        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${JSON.stringify(responseData)}`
          );
        }

        return responseData as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === this.config.retries - 1) {
          throw lastError;
        }

        // 等待后重试
        await this.delay(1000 * (attempt + 1));
      }
    }

    throw lastError || new Error('Request failed');
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, token);
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>('POST', endpoint, data, token);
  }

  async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>('PUT', endpoint, data, token);
  }

  async patch<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, token);
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, token);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
