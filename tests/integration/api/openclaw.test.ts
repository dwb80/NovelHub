/**
 * 集成测试: OpenClaw模块API
 * 测试ID: INT-008
 */

import { createApiClient } from '../utils/api-client';
import { testUsers, openclawData } from '../fixtures/test-data';

describe('OpenClaw模块API集成测试', () => {
  const api = createApiClient();
  let authToken: string;
  let createdWorkId: number;

  beforeAll(async () => {
    // 登录获取token
    const response = await api.post('/auth/login', {
      email: testUsers.user1.email,
      password: testUsers.user1.password
    });
    authToken = response.data.token;
    api.setToken(authToken);
  });

  describe('OpenClaw状态', () => {
    test('INT-008: 获取OpenClaw激活状态', async () => {
      const response = await api.get('/openclaw/status');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('isActivated');
    });

    test('INT-008: 获取OpenClaw使用统计', async () => {
      const response = await api.get('/openclaw/stats');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('totalGenerations');
      expect(response.data).toHaveProperty('remainingQuota');
    });
  });

  describe('作品管理', () => {
    test('INT-008: 获取作品列表', async () => {
      const response = await api.get('/openclaw/works');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('list');
      expect(Array.isArray(response.data.list)).toBe(true);
    });

    test('INT-008: 创建新作品', async () => {
      const uniqueTitle = `${openclawData.title}_${Date.now()}`;

      const response = await api.post('/openclaw/works', {
        title: uniqueTitle,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(201);
      expect(response.data).toHaveProperty('id');
      
      createdWorkId = response.data.id;
    });

    test('INT-008: 获取作品详情', async () => {
      // 先创建一个作品
      const createResponse = await api.post('/openclaw/works', {
        title: `详情测试_${Date.now()}`,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      if (createResponse.code === 201) {
        const workId = createResponse.data.id;

        const response = await api.get(`/openclaw/works/${workId}`);

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('title');
        expect(response.data).toHaveProperty('description');
      }
    });

    test('INT-008: 更新作品信息', async () => {
      // 先创建一个作品
      const createResponse = await api.post('/openclaw/works', {
        title: `更新测试_${Date.now()}`,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      if (createResponse.code === 201) {
        const workId = createResponse.data.id;

        const response = await api.put(`/openclaw/works/${workId}`, {
          title: `更新后标题_${Date.now()}`,
          description: '更新后的描述'
        });

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
      }
    });

    test('INT-008: 删除作品', async () => {
      // 先创建一个作品
      const createResponse = await api.post('/openclaw/works', {
        title: `删除测试_${Date.now()}`,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      if (createResponse.code === 201) {
        const workId = createResponse.data.id;

        const response = await api.delete(`/openclaw/works/${workId}`);

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
      }
    });
  });

  describe('AI生成', () => {
    test('INT-008: 生成大纲', async () => {
      // 先创建一个作品
      const createResponse = await api.post('/openclaw/works', {
        title: `大纲生成测试_${Date.now()}`,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      if (createResponse.code === 201) {
        const workId = createResponse.data.id;

        const response = await api.post(`/openclaw/works/${workId}/outline`, {
          prompt: openclawData.prompt,
          chapters: openclawData.chapters
        });

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
        expect(response.data).toHaveProperty('outline');
      }
    });

    test('INT-008: 生成章节内容', async () => {
      // 先创建一个作品
      const createResponse = await api.post('/openclaw/works', {
        title: `章节生成测试_${Date.now()}`,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      if (createResponse.code === 201) {
        const workId = createResponse.data.id;

        const response = await api.post(`/openclaw/works/${workId}/chapters`, {
          chapterNumber: 1,
          title: '第一章',
          prompt: '生成第一章内容'
        });

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
        expect(response.data).toHaveProperty('content');
      }
    });

    test('INT-008: 获取生成任务状态', async () => {
      const response = await api.get('/openclaw/tasks');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('tasks');
      expect(Array.isArray(response.data.tasks)).toBe(true);
    });
  });

  describe('草稿管理', () => {
    test('INT-008: 保存草稿', async () => {
      // 先创建一个作品
      const createResponse = await api.post('/openclaw/works', {
        title: `草稿测试_${Date.now()}`,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      if (createResponse.code === 201) {
        const workId = createResponse.data.id;

        const response = await api.post(`/openclaw/works/${workId}/draft`, {
          content: '这是草稿内容',
          chapterNumber: 1
        });

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
      }
    });

    test('INT-008: 获取草稿列表', async () => {
      const response = await api.get('/openclaw/drafts');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('list');
      expect(Array.isArray(response.data.list)).toBe(true);
    });
  });

  describe('发布管理', () => {
    test('INT-008: 发布作品', async () => {
      // 先创建一个作品
      const createResponse = await api.post('/openclaw/works', {
        title: `发布测试_${Date.now()}`,
        description: openclawData.prompt,
        genre: openclawData.genre
      });

      if (createResponse.code === 201) {
        const workId = createResponse.data.id;

        const response = await api.post(`/openclaw/works/${workId}/publish`, {
          category: openclawData.genre,
          tags: ['AI生成', '科幻']
        });

        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
      }
    });
  });
});
