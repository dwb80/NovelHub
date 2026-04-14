/**
 * 集成测试: 用户认证API
 * 测试ID: INT-001, INT-002
 */

import { createApiClient } from '../utils/api-client';
import { testUsers, generateUniqueUser } from '../fixtures/test-data';

describe('用户认证API集成测试', () => {
  const api = createApiClient();
  let authToken: string;

  beforeAll(() => {
    // 测试前的准备工作
  });

  afterAll(() => {
    // 测试后的清理工作
  });

  describe('用户注册', () => {
    test('INT-001: 用户注册成功', async () => {
      const newUser = generateUniqueUser();

      const response = await api.post('/auth/register', {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(201);
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('token');
    });

    test('INT-001: 注册时邮箱已存在', async () => {
      const existingUser = testUsers.user1;

      const response = await api.post('/auth/register', {
        username: `user_${Date.now()}`,
        email: existingUser.email,
        password: existingUser.password
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(409);
      expect(response.message).toContain('已存在');
    });

    test('INT-001: 注册时参数缺失', async () => {
      const response = await api.post('/auth/register', {
        username: 'testuser',
        // 缺少email和password
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(400);
    });

    test('INT-001: 注册时密码强度不足', async () => {
      const newUser = generateUniqueUser();

      const response = await api.post('/auth/register', {
        username: newUser.username,
        email: newUser.email,
        password: '123' // 密码太短
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(400);
    });
  });

  describe('用户登录', () => {
    test('INT-002: 用户登录成功', async () => {
      const user = testUsers.user1;

      const response = await api.post('/auth/login', {
        email: user.email,
        password: user.password
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('user');
      
      // 保存token供后续测试使用
      authToken = response.data.token;
      api.setToken(authToken);
    });

    test('INT-002: 登录时密码错误', async () => {
      const user = testUsers.user1;

      const response = await api.post('/auth/login', {
        email: user.email,
        password: 'WrongPassword123'
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(401);
    });

    test('INT-002: 登录时用户不存在', async () => {
      const response = await api.post('/auth/login', {
        email: 'nonexistent@example.com',
        password: 'Test@123456'
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(404);
    });

    test('INT-002: 登录时参数缺失', async () => {
      const response = await api.post('/auth/login', {
        email: 'test@example.com'
        // 缺少password
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(400);
    });
  });

  describe('获取用户信息', () => {
    test('INT-002: 获取当前用户信息', async () => {
      // 确保已登录
      if (!authToken) {
        const loginResponse = await api.post('/auth/login', {
          email: testUsers.user1.email,
          password: testUsers.user1.password
        });
        authToken = loginResponse.data.token;
        api.setToken(authToken);
      }

      const response = await api.get('/auth/profile');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('username');
      expect(response.data).toHaveProperty('email');
    });

    test('INT-002: 未授权访问用户信息', async () => {
      api.clearToken();

      const response = await api.get('/auth/profile');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(401);
    });
  });

  describe('用户登出', () => {
    test('INT-002: 用户登出成功', async () => {
      // 先登录
      const loginResponse = await api.post('/auth/login', {
        email: testUsers.user1.email,
        password: testUsers.user1.password
      });
      api.setToken(loginResponse.data.token);

      const response = await api.post('/auth/logout');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      
      // 清除token
      api.clearToken();
    });
  });

  describe('Token刷新', () => {
    test('INT-002: 刷新Token', async () => {
      // 先登录获取refresh token
      const loginResponse = await api.post('/auth/login', {
        email: testUsers.user1.email,
        password: testUsers.user1.password
      });

      if (loginResponse.data.refreshToken) {
        const response = await api.post('/auth/refresh', {
          refreshToken: loginResponse.data.refreshToken
        });

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
        expect(response.data).toHaveProperty('token');
      }
    });
  });
});
