/**
 * 集成测试: 评论模块API
 * 测试ID: INT-005
 */

import { createApiClient } from '../utils/api-client';
import { testUsers, testNovels, testComments } from '../fixtures/test-data';

describe('评论模块API集成测试', () => {
  const api = createApiClient();
  let authToken: string;
  let createdCommentId: number;

  beforeAll(async () => {
    // 登录获取token
    const response = await api.post('/auth/login', {
      email: testUsers.user1.email,
      password: testUsers.user1.password
    });
    authToken = response.data.token;
    api.setToken(authToken);
  });

  describe('评论列表', () => {
    test('INT-005: 获取小说评论列表', async () => {
      const novel = testNovels.novel1;

      const response = await api.get(`/comments/novel/${novel.id}`, {
        page: 1,
        size: 20
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('list');
      expect(Array.isArray(response.data.list)).toBe(true);
    });

    test('INT-005: 获取章节评论列表', async () => {
      const chapterId = 1001001;

      const response = await api.get(`/comments/chapter/${chapterId}`, {
        page: 1,
        size: 20
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(Array.isArray(response.data.list)).toBe(true);
    });
  });

  describe('发表评论', () => {
    test('INT-005: 发表小说评论', async () => {
      const novel = testNovels.novel1;
      const commentData = {
        novelId: novel.id,
        content: `集成测试评论 ${Date.now()}`,
        rating: 5
      };

      const response = await api.post('/comments', commentData);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(201);
      expect(response.data).toHaveProperty('id');
      
      createdCommentId = response.data.id;
    });

    test('INT-005: 发表评论时内容为空', async () => {
      const novel = testNovels.novel1;

      const response = await api.post('/comments', {
        novelId: novel.id,
        content: '',
        rating: 5
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(400);
    });

    test('INT-005: 未授权发表评论', async () => {
      api.clearToken();
      const novel = testNovels.novel1;

      const response = await api.post('/comments', {
        novelId: novel.id,
        content: '测试评论',
        rating: 5
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(401);
      
      // 恢复token
      api.setToken(authToken);
    });
  });

  describe('评论回复', () => {
    test('INT-005: 回复评论', async () => {
      // 先创建一个评论
      const novel = testNovels.novel1;
      const commentResponse = await api.post('/comments', {
        novelId: novel.id,
        content: `父评论 ${Date.now()}`,
        rating: 5
      });

      if (commentResponse.code === 201) {
        const parentId = commentResponse.data.id;

        const replyResponse = await api.post('/comments', {
          novelId: novel.id,
          content: `回复评论 ${Date.now()}`,
          parentId: parentId
        });

        expect(replyResponse).toBeValidApiResponse();
        expect(replyResponse.code).toBe(201);
      }
    });
  });

  describe('评论点赞', () => {
    test('INT-005: 点赞评论', async () => {
      // 先创建一个评论
      const novel = testNovels.novel1;
      const commentResponse = await api.post('/comments', {
        novelId: novel.id,
        content: `点赞测试 ${Date.now()}`,
        rating: 5
      });

      if (commentResponse.code === 201) {
        const commentId = commentResponse.data.id;

        const likeResponse = await api.post(`/comments/${commentId}/like`);

        expect(likeResponse).toBeValidApiResponse();
        expect(likeResponse.code).toBe(200);
      }
    });

    test('INT-005: 取消点赞', async () => {
      // 先创建一个评论
      const novel = testNovels.novel1;
      const commentResponse = await api.post('/comments', {
        novelId: novel.id,
        content: `取消点赞测试 ${Date.now()}`,
        rating: 5
      });

      if (commentResponse.code === 201) {
        const commentId = commentResponse.data.id;

        // 先点赞
        await api.post(`/comments/${commentId}/like`);

        // 再取消点赞
        const unlikeResponse = await api.delete(`/comments/${commentId}/like`);

        expect(unlikeResponse).toBeValidApiResponse();
        expect(unlikeResponse.code).toBe(200);
      }
    });
  });

  describe('删除评论', () => {
    test('INT-005: 删除自己的评论', async () => {
      // 先创建一个评论
      const novel = testNovels.novel1;
      const commentResponse = await api.post('/comments', {
        novelId: novel.id,
        content: `删除测试 ${Date.now()}`,
        rating: 5
      });

      if (commentResponse.code === 201) {
        const commentId = commentResponse.data.id;

        const deleteResponse = await api.delete(`/comments/${commentId}`);

        expect(deleteResponse).toBeValidApiResponse();
        expect(deleteResponse.code).toBe(200);
      }
    });

    test('INT-005: 删除不存在的评论', async () => {
      const response = await api.delete('/comments/999999');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(404);
    });
  });

  describe('评分功能', () => {
    test('INT-005: 给小说评分', async () => {
      const novel = testNovels.novel1;

      const response = await api.post('/comments', {
        novelId: novel.id,
        content: '评分测试',
        rating: 4
      });

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(201);
      expect(response.data).toHaveProperty('rating');
      expect(response.data.rating).toBe(4);
    });

    test('INT-005: 获取小说评分', async () => {
      const novel = testNovels.novel1;

      const response = await api.get(`/novels/${novel.id}/rating`);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('average');
      expect(response.data).toHaveProperty('count');
    });
  });
});
