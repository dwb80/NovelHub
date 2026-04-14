/**
 * 集成测试: 书架模块API
 * 测试ID: INT-004
 */

import { createApiClient } from '../utils/api-client';
import { testUsers, testNovels } from '../fixtures/test-data';

describe('书架模块API集成测试', () => {
  const api = createApiClient();
  let authToken: string;

  beforeAll(async () => {
    // 登录获取token
    const response = await api.post('/auth/login', {
      email: testUsers.user1.email,
      password: testUsers.user1.password
    });
    authToken = response.data.token;
    api.setToken(authToken);
  });

  describe('书架列表', () => {
    test('INT-004: 获取书架列表', async () => {
      const response = await api.get('/bookshelf');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('list');
      expect(Array.isArray(response.data.list)).toBe(true);
    });

    test('INT-004: 未授权访问书架', async () => {
      api.clearToken();
      const response = await api.get('/bookshelf');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(401);
      
      // 恢复token
      api.setToken(authToken);
    });
  });

  describe('添加/删除书架', () => {
    test('INT-004: 添加小说到书架', async () => {
      const novel = testNovels.novel3;

      const response = await api.post('/bookshelf', {
        novelId: novel.id
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(201);
    });

    test('INT-004: 重复添加小说到书架', async () => {
      const novel = testNovels.novel3;

      const response = await api.post('/bookshelf', {
        novelId: novel.id
      });

      expect(response).toBeValidApiResponse();
      // 应该返回409或200
      expect([200, 201, 409]).toContain(response.code);
    });

    test('INT-004: 从书架删除小说', async () => {
      const novel = testNovels.novel3;

      const response = await api.delete(`/bookshelf/${novel.id}`);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
    });

    test('INT-004: 删除不存在的小说', async () => {
      const response = await api.delete('/bookshelf/999999');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(404);
    });
  });

  describe('追更设置', () => {
    test('INT-004: 更新追更设置', async () => {
      const novel = testNovels.novel1;

      const response = await api.put(`/bookshelf/subscription/${novel.id}`, {
        isSubscribed: true,
        autoPurchase: false,
        notifyUpdate: true
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
    });

    test('INT-004: 取消追更', async () => {
      const novel = testNovels.novel1;

      const response = await api.put(`/bookshelf/subscription/${novel.id}`, {
        isSubscribed: false
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
    });
  });

  describe('书架分类', () => {
    test('INT-004: 获取书架分类', async () => {
      const response = await api.get('/bookshelf/categories');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('INT-004: 创建书架分类', async () => {
      const categoryName = `测试分类${Date.now()}`;

      const response = await api.post('/bookshelf/categories', {
        name: categoryName
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(201);
    });

    test('INT-004: 移动小说到分类', async () => {
      const novel = testNovels.novel1;
      const categoryId = 1; // 假设存在ID为1的分类

      const response = await api.put(`/bookshelf/${novel.id}/category`, {
        categoryId
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
    });
  });

  describe('阅读历史', () => {
    test('INT-004: 获取阅读历史', async () => {
      const response = await api.get('/bookshelf/history');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('list');
      expect(Array.isArray(response.data.list)).toBe(true);
    });

    test('INT-004: 清空阅读历史', async () => {
      const response = await api.delete('/bookshelf/history');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
    });
  });
});
