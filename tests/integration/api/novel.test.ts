/**
 * 集成测试: 小说模块API
 * 测试ID: INT-003
 */

import { createApiClient } from '../utils/api-client';
import { testUsers, testNovels, testChapters } from '../fixtures/test-data';

describe('小说模块API集成测试', () => {
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

  describe('小说列表', () => {
    test('INT-003: 获取小说列表', async () => {
      const response = await api.get('/novels', {
        page: 1,
        size: 20
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('list');
      expect(response.data).toHaveProperty('total');
      expect(Array.isArray(response.data.list)).toBe(true);
    });

    test('INT-003: 按分类筛选小说', async () => {
      const response = await api.get('/novels', {
        category: '玄幻',
        page: 1,
        size: 20
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(Array.isArray(response.data.list)).toBe(true);
    });

    test('INT-003: 获取小说详情', async () => {
      const novel = testNovels.novel1;
      const response = await api.get(`/novels/${novel.id}`);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('author');
      expect(response.data).toHaveProperty('description');
    });

    test('INT-003: 获取不存在的小说详情', async () => {
      const response = await api.get('/novels/999999');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(404);
    });
  });

  describe('小说搜索', () => {
    test('INT-003: 搜索小说', async () => {
      const response = await api.get('/novels/search', {
        q: '斗破'
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('results');
      expect(Array.isArray(response.data.results)).toBe(true);
    });

    test('INT-003: 搜索无结果', async () => {
      const response = await api.get('/novels/search', {
        q: 'xyzabc123'
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data.results).toHaveLength(0);
    });

    test('INT-003: 搜索建议', async () => {
      const response = await api.get('/novels/search/suggestions', {
        q: '斗'
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('章节管理', () => {
    test('INT-003: 获取小说章节列表', async () => {
      const novel = testNovels.novel1;
      const response = await api.get(`/novels/${novel.id}/chapters`);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('chapters');
      expect(Array.isArray(response.data.chapters)).toBe(true);
    });

    test('INT-003: 获取章节内容', async () => {
      const chapter = testChapters.chapter1;
      const response = await api.get(`/chapters/${chapter.id}`);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('content');
    });

    test('INT-003: 获取VIP章节内容（未购买）', async () => {
      const chapter = testChapters.vipChapter;
      const response = await api.get(`/chapters/${chapter.id}`);

      expect(response).toBeValidApiResponse();
      // 应该返回403或提示购买
      expect([200, 403]).toContain(response.code);
    });
  });

  describe('阅读进度', () => {
    test('INT-003: 更新阅读进度', async () => {
      const novel = testNovels.novel1;
      const chapter = testChapters.chapter1;

      const response = await api.post('/chapters/progress', {
        novelId: novel.id,
        chapterId: chapter.id,
        progress: 50.5
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
    });

    test('INT-003: 获取阅读进度', async () => {
      const novel = testNovels.novel1;
      const response = await api.get(`/chapters/progress/${novel.id}`);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('chapterId');
      expect(response.data).toHaveProperty('progress');
    });
  });

  describe('排行榜', () => {
    test('INT-003: 获取排行榜', async () => {
      const response = await api.get('/novels/ranking', {
        type: 'monthly',
        category: '玄幻'
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('list');
      expect(Array.isArray(response.data.list)).toBe(true);
    });

    test('INT-003: 获取不同榜单类型', async () => {
      const types = ['daily', 'weekly', 'monthly', 'total'];
      
      for (const type of types) {
        const response = await api.get('/novels/ranking', { type });
        expect(response).toBeValidApiResponse();
        expect(response.code).toBe(200);
      }
    });
  });
});
