/**
 * P0级测试: 越权访问测试
 * 测试ID: TEST-P0-004
 * 覆盖: 水平越权测试、垂直越权测试、IDOR漏洞检测
 */

import { createApiClient } from '../utils/api-client';
import { testUsers, testNovels } from '../fixtures/test-data';

describe('TEST-P0-004: 越权访问测试', () => {
  const api = createApiClient();
  let user1Token: string;
  let user1Id: number;
  let user2Token: string;
  let user2Id: number;
  let adminToken: string;
  let adminId: number;

  beforeAll(async () => {
    // 用户1登录
    const user1Response = await api.post('/auth/login', {
      email: testUsers.user1.email,
      password: testUsers.user1.password
    });
    user1Token = user1Response.data.token;
    user1Id = user1Response.data.userId;

    // 用户2登录
    const user2Response = await api.post('/auth/login', {
      email: testUsers.user2.email,
      password: testUsers.user2.password
    });
    user2Token = user2Response.data.token;
    user2Id = user2Response.data.userId;

    // 管理员登录
    const adminResponse = await api.post('/auth/login', {
      email: testUsers.admin.email,
      password: testUsers.admin.password
    });
    adminToken = adminResponse.data.token;
    adminId = adminResponse.data.userId;
  });

  describe('水平越权测试 - 同权限用户间越权', () => {
    test('TEST-P0-004-001: 用户A访问用户B的个人资料', async () => {
      api.setToken(user1Token);

      // 尝试访问用户2的完整资料
      const response = await api.get(`/users/${user2Id}/profile/full`);

      // 应该返回403或脱敏后的数据
      if (response.code === 200) {
        // 如果返回200，敏感信息应该被脱敏
        if (response.data.email) {
          expect(response.data.email).toContain('*');
        }
        if (response.data.phone) {
          expect(response.data.phone).toContain('*');
        }
      } else {
        expect(response.code).toBe(403);
      }
    });

    test('TEST-P0-004-002: 用户A修改用户B的资料', async () => {
      api.setToken(user1Token);

      const response = await api.put(`/users/${user2Id}/profile`, {
        nickname: '被篡改的昵称',
        bio: '被篡改的简介'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-003: 用户A访问用户B的阅读历史', async () => {
      api.setToken(user1Token);

      const response = await api.get(`/users/${user2Id}/reading-history`);
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-004: 用户A访问用户B的书架', async () => {
      api.setToken(user1Token);

      const response = await api.get(`/users/${user2Id}/bookshelf`);
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-005: 用户A访问用户B的收藏列表', async () => {
      api.setToken(user1Token);

      const response = await api.get(`/users/${user2Id}/favorites`);
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-006: 用户A删除用户B的评论', async () => {
      api.setToken(user1Token);

      const response = await api.delete(`/comments/999?user_id=${user2Id}`);
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-007: 用户A修改用户B的设置', async () => {
      api.setToken(user1Token);

      const response = await api.put(`/users/${user2Id}/settings`, {
        notification_enabled: false,
        privacy_level: 'private'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-008: 用户A查看用户B的订单记录', async () => {
      api.setToken(user1Token);

      const response = await api.get(`/users/${user2Id}/orders`);
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-009: 用户A操作用户B的支付信息', async () => {
      api.setToken(user1Token);

      const response = await api.get(`/users/${user2Id}/payment-methods`);
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-010: 用户A访问用户B的消息通知', async () => {
      api.setToken(user1Token);

      const response = await api.get(`/users/${user2Id}/notifications`);
      expect(response.code).toBe(403);
    });
  });

  describe('垂直越权测试 - 低权限用户访问高权限资源', () => {
    test('TEST-P0-004-011: 普通用户访问管理员仪表盘', async () => {
      api.setToken(user1Token);

      const response = await api.get('/admin/dashboard');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-012: 普通用户查看所有用户列表', async () => {
      api.setToken(user1Token);

      const response = await api.get('/admin/users');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-013: 普通用户封禁其他用户', async () => {
      api.setToken(user1Token);

      const response = await api.post('/admin/users/999/ban', {
        reason: '恶意封禁'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-014: 普通用户修改系统配置', async () => {
      api.setToken(user1Token);

      const response = await api.put('/admin/config', {
        site_name: '被篡改的网站名称',
        maintenance_mode: true
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-015: 普通用户查看系统日志', async () => {
      api.setToken(user1Token);

      const response = await api.get('/admin/logs');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-016: 普通用户删除敏感内容', async () => {
      api.setToken(user1Token);

      const response = await api.delete('/admin/content/999');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-017: 普通用户管理敏感词', async () => {
      api.setToken(user1Token);

      const response = await api.post('/admin/sensitive-words', {
        word: '测试敏感词'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-018: 普通用户审核内容', async () => {
      api.setToken(user1Token);

      const response = await api.post('/admin/review/approve', {
        content_id: 999,
        action: 'approve'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-019: 普通用户查看财务报表', async () => {
      api.setToken(user1Token);

      const response = await api.get('/admin/finance/reports');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-004-020: 普通用户管理角色权限', async () => {
      api.setToken(user1Token);

      const response = await api.post('/admin/roles', {
        name: '新角色',
        permissions: ['all']
      });

      expect(response.code).toBe(403);
    });
  });

  describe('IDOR漏洞检测 - 不安全的直接对象引用', () => {
    test('TEST-P0-004-021: 通过ID遍历访问他人资源', async () => {
      api.setToken(user1Token);

      // 尝试通过递增ID访问其他用户的资源
      const ids = [user1Id - 1, user1Id - 2, user1Id + 100, user1Id + 1000];

      for (const id of ids) {
        if (id > 0) {
          const response = await api.get(`/users/${id}/profile/private`);
          // 应该返回403或404，不应该返回其他用户的敏感数据
          expect([403, 404]).toContain(response.code);
        }
      }
    });

    test('TEST-P0-004-022: 通过ID遍历访问他人订单', async () => {
      api.setToken(user1Token);

      // 尝试遍历订单ID
      for (let orderId = 1; orderId <= 10; orderId++) {
        const response = await api.get(`/orders/${orderId}`);
        // 如果不是自己的订单，应该返回403
        if (response.code === 200) {
          expect(response.data.user_id).toBe(user1Id);
        }
      }
    });

    test('TEST-P0-004-023: 通过ID遍历访问他人作品', async () => {
      api.setToken(user1Token);

      // 尝试访问不属于自己的作品管理接口
      const response = await api.put(`/novels/999/manage`, {
        status: 'deleted'
      });

      expect([403, 404]).toContain(response.code);
    });

    test('TEST-P0-004-024: 通过ID遍历访问他人评论', async () => {
      api.setToken(user1Token);

      // 尝试编辑不属于自己的评论
      const response = await api.put(`/comments/999`, {
        content: '被篡改的评论内容'
      });

      expect([403, 404]).toContain(response.code);
    });

    test('TEST-P0-004-025: 通过ID遍历访问他人章节', async () => {
      api.setToken(user1Token);

      // 尝试编辑不属于自己的章节
      const response = await api.put(`/chapters/999`, {
        title: '被篡改的章节标题',
        content: '被篡改的章节内容'
      });

      expect([403, 404]).toContain(response.code);
    });

    test('TEST-P0-004-026: 通过ID遍历访问他人收藏', async () => {
      api.setToken(user1Token);

      // 尝试删除不属于自己的收藏
      const response = await api.delete(`/favorites/999`);
      expect([403, 404]).toContain(response.code);
    });

    test('TEST-P0-004-027: 通过ID遍历访问他人书签', async () => {
      api.setToken(user1Token);

      // 尝试访问不属于自己的书签
      const response = await api.get(`/bookmarks/999`);
      expect([403, 404]).toContain(response.code);
    });

    test('TEST-P0-004-028: 通过ID遍历访问他人通知', async () => {
      api.setToken(user1Token);

      // 尝试读取不属于自己的通知
      const response = await api.get(`/notifications/999`);
      expect([403, 404]).toContain(response.code);
    });

    test('TEST-P0-004-029: 通过ID遍历访问他人阅读进度', async () => {
      api.setToken(user1Token);

      // 尝试修改不属于自己的阅读进度
      const response = await api.put(`/reading-progress/999`, {
        chapter_id: 100,
        progress: 50
      });

      expect([403, 404]).toContain(response.code);
    });

    test('TEST-P0-004-030: 通过ID遍历访问他人设置', async () => {
      api.setToken(user1Token);

      // 尝试修改不属于自己的设置
      const response = await api.put(`/settings/999`, {
        theme: 'dark'
      });

      expect([403, 404]).toContain(response.code);
    });
  });

  describe('参数篡改越权测试', () => {
    test('TEST-P0-004-031: 通过body参数篡改用户ID', async () => {
      api.setToken(user1Token);

      // 尝试在请求体中注入其他用户ID
      const response = await api.post('/comments', {
        novel_id: 1,
        content: '测试评论',
        user_id: user2Id  // 尝试注入其他用户ID
      });

      // 如果请求成功，评论应该属于当前登录用户，而不是注入的user_id
      if (response.code === 201) {
        const commentId = response.data.id;
        const commentResponse = await api.get(`/comments/${commentId}`);
        expect(commentResponse.data.user_id).toBe(user1Id);
      }
    });

    test('TEST-P0-004-032: 通过URL参数篡改用户ID', async () => {
      api.setToken(user1Token);

      // 尝试通过URL参数注入其他用户ID
      const response = await api.get(`/user/profile?user_id=${user2Id}`);

      // 应该返回当前登录用户的信息，而不是注入的用户
      if (response.code === 200) {
        expect(response.data.id).toBe(user1Id);
      }
    });

    test('TEST-P0-004-033: 通过header参数篡改用户ID', async () => {
      api.setToken(user1Token);

      // 尝试通过header注入其他用户ID
      const response = await api.get('/user/profile', {
        headers: {
          'X-User-ID': String(user2Id)
        }
      });

      // 应该返回当前登录用户的信息
      if (response.code === 200) {
        expect(response.data.id).toBe(user1Id);
      }
    });

    test('TEST-P0-004-034: 通过cookie篡改用户ID', async () => {
      api.setToken(user1Token);

      // 尝试通过cookie注入其他用户ID
      const response = await api.get('/user/profile', {
        headers: {
          'Cookie': `user_id=${user2Id}`
        }
      });

      // 应该返回当前登录用户的信息
      if (response.code === 200) {
        expect(response.data.id).toBe(user1Id);
      }
    });

    test('TEST-P0-004-035: 批量操作中的IDOR漏洞', async () => {
      api.setToken(user1Token);

      // 尝试在批量操作中包含其他用户的资源ID
      const response = await api.post('/bookmarks/batch-delete', {
        ids: [1, 2, 3, 999, 1000]  // 包含可能不属于当前用户的ID
      });

      // 应该只删除当前用户拥有的资源，或返回403
      expect([200, 403]).toContain(response.code);
    });
  });

  describe('API端点越权测试', () => {
    test('TEST-P0-004-036: 未授权访问私有API', async () => {
      api.clearToken();

      const privateEndpoints = [
        '/user/profile',
        '/users/1/bookshelf',
        '/orders',
        '/notifications'
      ];

      for (const endpoint of privateEndpoints) {
        const response = await api.get(endpoint);
        expect(response.code).toBe(401);
      }
    });

    test('TEST-P0-004-037: 使用过期Token访问资源', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE1MDAwMDAwMDB9.invalid';
      api.setToken(expiredToken);

      const response = await api.get('/user/profile');
      expect(response.code).toBe(401);
    });

    test('TEST-P0-004-038: 使用无效Token访问资源', async () => {
      api.setToken('invalid_token_format');

      const response = await api.get('/user/profile');
      expect(response.code).toBe(401);
    });

    test('TEST-P0-004-039: 使用伪造Token访问资源', async () => {
      // 构造一个伪造的JWT
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo5OTksInJvbGUiOiJhZG1pbiJ9.fake';
      api.setToken(fakeToken);

      const response = await api.get('/admin/users');
      expect(response.code).toBe(401);
    });

    test('TEST-P0-004-040: 跨用户Token使用', async () => {
      // 使用用户1的Token操作用户2的资源
      api.setToken(user1Token);

      const response = await api.put(`/users/${user2Id}/settings`, {
        theme: 'dark'
      });

      expect(response.code).toBe(403);
    });
  });

  describe('功能级越权测试', () => {
    test('TEST-P0-004-041: 普通用户执行管理员专属操作', async () => {
      api.setToken(user1Token);

      const adminOperations = [
        { method: 'GET', url: '/admin/statistics' },
        { method: 'POST', url: '/admin/announcements', data: { title: '公告', content: '内容' } },
        { method: 'DELETE', url: '/admin/users/999' },
        { method: 'PUT', url: '/admin/system/maintenance', data: { enabled: true } }
      ];

      for (const op of adminOperations) {
        let response;
        switch (op.method) {
          case 'GET':
            response = await api.get(op.url);
            break;
          case 'POST':
            response = await api.post(op.url, op.data || {});
            break;
          case 'DELETE':
            response = await api.delete(op.url);
            break;
          case 'PUT':
            response = await api.put(op.url, op.data || {});
            break;
        }
        expect(response?.code).toBe(403);
      }
    });

    test('TEST-P0-004-042: 未激活OpenClaw执行创作操作', async () => {
      // 使用未激活的OpenClaw账号
      const inactiveResponse = await api.post('/auth/login', {
        email: testUsers.inactiveUser.email,
        password: testUsers.inactiveUser.password
      });

      if (inactiveResponse.code === 200) {
        api.setToken(inactiveResponse.data.token);

        const response = await api.post('/openclaw/works', {
          title: '测试作品',
          description: '测试描述'
        });

        expect(response.code).toBe(403);
      }
    });

    test('TEST-P0-004-043: 已暂停OpenClaw执行创作操作', async () => {
      // 使用已暂停的OpenClaw账号
      const suspendedResponse = await api.post('/auth/login', {
        email: testUsers.suspendedUser?.email || 'suspended@test.com',
        password: testUsers.suspendedUser?.password || 'Test@123456'
      });

      if (suspendedResponse.code === 200) {
        api.setToken(suspendedResponse.data.token);

        const response = await api.post('/openclaw/works', {
          title: '测试作品',
          description: '测试描述'
        });

        expect(response.code).toBe(403);
      }
    });

    test('TEST-P0-004-044: Free等级OpenClaw超越配额限制', async () => {
      api.setToken(user1Token);

      // 尝试创建超过配额的作品数量
      const response = await api.post('/openclaw/works', {
        title: '超出配额的作品',
        description: '测试描述'
      });

      // 如果超过配额，应该返回403
      if (response.code === 403) {
        expect(response.message).toContain('配额');
      }
    });

    test('TEST-P0-004-045: 未付费用户访问VIP内容', async () => {
      api.setToken(user1Token);

      // 尝试访问VIP章节
      const response = await api.get(`/novels/${testNovels.vipNovel.id}/chapters/5/content`);

      // 应该返回403或要求付费
      expect([403, 402, 401]).toContain(response.code);
    });
  });

  describe('越权访问防护验证', () => {
    test('TEST-P0-004-046: 正确的权限控制响应', async () => {
      api.setToken(user1Token);

      const response = await api.get('/admin/users');

      expect(response.code).toBe(403);
      // 不应该暴露过多信息
      expect(response.message).not.toContain('admin');
      expect(response.message).not.toContain('root');
      expect(response.message).not.toContain('superuser');
    });

    test('TEST-P0-004-047: 资源不存在时的权限控制', async () => {
      api.setToken(user1Token);

      // 访问不存在的资源，应该返回404而不是403
      // 这样可以防止通过403/404差异进行资源探测
      const response = await api.get('/users/999999/profile');

      // 优先返回404，不暴露资源是否存在
      expect(response.code).toBe(404);
    });

    test('TEST-P0-004-048: 批量操作的权限隔离', async () => {
      api.setToken(user1Token);

      // 用户1创建一些资源
      const createResponse = await api.post('/bookmarks', {
        novel_id: testNovels.novel1.id
      });

      if (createResponse.code === 201) {
        const bookmarkId = createResponse.data.id;

        // 切换到用户2
        api.setToken(user2Token);

        // 用户2尝试删除用户1的书签
        const deleteResponse = await api.delete(`/bookmarks/${bookmarkId}`);
        expect(deleteResponse.code).toBe(403);

        // 切换回用户1
        api.setToken(user1Token);

        // 用户1可以删除自己的书签
        const selfDeleteResponse = await api.delete(`/bookmarks/${bookmarkId}`);
        expect(selfDeleteResponse.code).toBe(200);
      }
    });

    test('TEST-P0-004-049: 管理员可以访问所有资源', async () => {
      api.setToken(adminToken);

      // 管理员可以访问用户1的资源
      const response = await api.get(`/admin/users/${user1Id}/profile`);
      expect([200, 404]).toContain(response.code);
    });

    test('TEST-P0-004-050: 资源所有者验证', async () => {
      api.setToken(user1Token);

      // 获取当前用户的资源列表
      const resourcesResponse = await api.get('/user/resources');

      if (resourcesResponse.code === 200 && resourcesResponse.data.resources) {
        const resources = resourcesResponse.data.resources;

        for (const resource of resources.slice(0, 5)) {
          // 验证每个资源的所有者
          expect(resource.owner_id).toBe(user1Id);
        }
      }
    });
  });
});
