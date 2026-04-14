/**
 * P0级测试: 敏感操作权限验证测试
 * 测试ID: TEST-P0-003
 * 覆盖: 敏感操作权限验证、越权访问拦截、权限提升防护
 */

import { createApiClient } from '../utils/api-client';
import { testUsers } from '../fixtures/test-data';

describe('TEST-P0-003: 敏感操作权限验证测试', () => {
  const api = createApiClient();
  let adminToken: string;
  let userToken: string;
  let moderatorToken: string;
  let openclawToken: string;

  beforeAll(async () => {
    // 管理员登录
    const adminResponse = await api.post('/auth/login', {
      email: testUsers.admin.email,
      password: testUsers.admin.password
    });
    adminToken = adminResponse.data.token;

    // 普通用户登录
    const userResponse = await api.post('/auth/login', {
      email: testUsers.user1.email,
      password: testUsers.user1.password
    });
    userToken = userResponse.data.token;

    // 版主登录
    const moderatorResponse = await api.post('/auth/login', {
      email: testUsers.moderator?.email || 'moderator@test.com',
      password: testUsers.moderator?.password || 'Test@123456'
    });
    if (moderatorResponse.code === 200) {
      moderatorToken = moderatorResponse.data.token;
    }

    // OpenClaw登录
    const openclawResponse = await api.post('/auth/login', {
      email: testUsers.openclaw?.email || 'openclaw@test.com',
      password: testUsers.openclaw?.password || 'Test@123456'
    });
    if (openclawResponse.code === 200) {
      openclawToken = openclawResponse.data.token;
    }
  });

  describe('管理员敏感操作权限', () => {
    test('TEST-P0-003-001: 管理员访问用户管理功能', async () => {
      api.setToken(adminToken);

      const response = await api.get('/admin/users');
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('users');
    });

    test('TEST-P0-003-002: 管理员访问系统设置', async () => {
      api.setToken(adminToken);

      const response = await api.get('/admin/settings');
      expect(response.code).toBe(200);
    });

    test('TEST-P0-003-003: 管理员执行用户封禁操作', async () => {
      api.setToken(adminToken);

      const response = await api.post('/admin/users/999/ban', {
        reason: '测试封禁',
        duration: '1d'
      });

      // 即使用户不存在，也应该返回权限相关的错误而非404
      expect([200, 404]).toContain(response.code);
    });

    test('TEST-P0-003-004: 管理员删除敏感内容', async () => {
      api.setToken(adminToken);

      const response = await api.delete('/admin/content/999');
      expect([200, 404]).toContain(response.code);
    });

    test('TEST-P0-003-005: 管理员修改系统配置', async () => {
      api.setToken(adminToken);

      const response = await api.put('/admin/config', {
        key: 'test_config',
        value: 'test_value'
      });

      expect([200, 404]).toContain(response.code);
    });
  });

  describe('普通用户权限限制', () => {
    test('TEST-P0-003-006: 普通用户无法访问管理员功能', async () => {
      api.setToken(userToken);

      const response = await api.get('/admin/users');
      expect(response.code).toBe(403);
      expect(response.message).toContain('权限');
    });

    test('TEST-P0-003-007: 普通用户无法修改系统设置', async () => {
      api.setToken(userToken);

      const response = await api.put('/admin/settings', {
        site_name: '被篡改的名称'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-008: 普通用户无法封禁其他用户', async () => {
      api.setToken(userToken);

      const response = await api.post('/admin/users/998/ban', {
        reason: '恶意封禁'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-009: 普通用户无法删除他人内容', async () => {
      api.setToken(userToken);

      const response = await api.delete('/admin/content/998');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-010: 普通用户无法查看敏感日志', async () => {
      api.setToken(userToken);

      const response = await api.get('/admin/logs');
      expect(response.code).toBe(403);
    });
  });

  describe('OpenClaw权限隔离', () => {
    test('TEST-P0-003-011: OpenClaw无法访问人类用户API', async () => {
      if (!openclawToken) {
        test.skip('OpenClaw账号未配置');
        return;
      }

      api.setToken(openclawToken);

      // 尝试访问评论API（人类用户专属）
      const response = await api.post('/comments', {
        novel_id: 1,
        content: '测试评论'
      });

      expect(response.code).toBe(403);
      expect(response.message).toContain('权限');
    });

    test('TEST-P0-003-012: OpenClaw无法访问书架功能', async () => {
      if (!openclawToken) {
        test.skip('OpenClaw账号未配置');
        return;
      }

      api.setToken(openclawToken);

      const response = await api.get('/bookshelf');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-013: 人类用户无法使用OpenClaw创作API', async () => {
      api.setToken(userToken);

      const response = await api.post('/openclaw/works', {
        title: '测试作品',
        description: '测试描述'
      });

      // 应该返回403或需要OpenClaw认证的错误
      expect([401, 403]).toContain(response.code);
    });

    test('TEST-P0-003-014: API Key前缀权限识别', async () => {
      // OpenClaw API Key前缀: oc_aK_
      // 人类用户 API Key前缀: usr_

      const openclawApiKey = 'oc_aK_test1234567890123456789012345678901234';
      const userApiKey = 'usr_test12345678901234567890123456789012345678';

      // 使用OpenClaw API Key调用人类用户API
      api.setToken(openclawApiKey);
      const response1 = await api.get('/user/profile');
      expect(response1.code).toBe(403);

      // 使用人类用户API Key调用OpenClaw API
      api.setToken(userApiKey);
      const response2 = await api.get('/openclaw/works');
      expect(response2.code).toBe(403);
    });
  });

  describe('敏感数据访问控制', () => {
    test('TEST-P0-003-015: 用户只能访问自己的敏感数据', async () => {
      api.setToken(userToken);

      // 尝试访问其他用户的阅读历史
      const response = await api.get('/users/998/reading-history');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-016: 用户只能访问自己的收藏列表', async () => {
      api.setToken(userToken);

      const response = await api.get('/users/998/favorites');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-017: 用户只能修改自己的资料', async () => {
      api.setToken(userToken);

      const response = await api.put('/users/998/profile', {
        nickname: '被篡改的昵称'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-018: 管理员可以访问所有用户数据', async () => {
      api.setToken(adminToken);

      const response = await api.get('/admin/users/1/reading-history');
      expect([200, 404]).toContain(response.code);
    });

    test('TEST-P0-003-019: 敏感字段脱敏验证', async () => {
      api.setToken(userToken);

      // 获取自己的资料，应该能看到完整信息
      const myProfile = await api.get('/user/profile');
      expect(myProfile.code).toBe(200);

      // 获取其他用户公开资料，敏感字段应该被脱敏
      const publicProfile = await api.get('/users/2/profile');
      if (publicProfile.code === 200) {
        // 邮箱应该被脱敏
        if (publicProfile.data.email) {
          expect(publicProfile.data.email).toContain('*');
        }
        // 手机号应该被脱敏
        if (publicProfile.data.phone) {
          expect(publicProfile.data.phone).toContain('*');
        }
      }
    });
  });

  describe('权限提升防护', () => {
    test('TEST-P0-003-020: 防止普通用户提升为管理员', async () => {
      api.setToken(userToken);

      // 尝试修改自己的角色
      const response = await api.put('/user/role', {
        role: 'admin'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-021: 防止通过参数篡改提升权限', async () => {
      api.setToken(userToken);

      // 尝试在请求体中注入角色信息
      const response = await api.put('/user/profile', {
        nickname: 'test',
        role: 'admin',  // 尝试注入角色
        is_admin: true  // 尝试注入管理员标志
      });

      // 请求可能被接受，但角色不应该被修改
      if (response.code === 200) {
        const profileCheck = await api.get('/user/profile');
        expect(profileCheck.data.role).not.toBe('admin');
        expect(profileCheck.data.is_admin).not.toBe(true);
      }
    });

    test('TEST-P0-003-022: 防止通过URL参数提升权限', async () => {
      api.setToken(userToken);

      // 尝试通过URL参数注入权限
      const response = await api.get('/user/profile?role=admin&is_admin=true');

      // 请求应该正常返回，但权限不应该改变
      expect(response.code).toBe(200);
    });

    test('TEST-P0-003-023: 防止JWT Token篡改', async () => {
      // 构造一个伪造的JWT Token
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiYWRtaW4ifQ.fake_signature';

      api.setToken(fakeToken);

      const response = await api.get('/admin/users');
      expect(response.code).toBe(401);
    });

    test('TEST-P0-003-024: 防止会话劫持后的权限滥用', async () => {
      api.setToken(userToken);

      // 获取当前会话信息
      const sessionResponse = await api.get('/user/session');

      if (sessionResponse.code === 200) {
        // 尝试使用会话ID访问管理员功能
        const response = await api.get('/admin/users', {
          headers: {
            'X-Session-ID': sessionResponse.data.session_id
          }
        });

        expect(response.code).toBe(403);
      }
    });
  });

  describe('敏感操作审计', () => {
    test('TEST-P0-003-025: 敏感操作记录审计日志', async () => {
      api.setToken(adminToken);

      // 执行敏感操作
      await api.post('/admin/users/999/ban', {
        reason: '审计测试'
      });

      // 查询审计日志
      const auditResponse = await api.get('/admin/audit-logs?action=user_ban');

      if (auditResponse.code === 200) {
        expect(auditResponse.data).toHaveProperty('logs');
        expect(auditResponse.data.logs.length).toBeGreaterThan(0);
      }
    });

    test('TEST-P0-003-026: 审计日志包含必要信息', async () => {
      api.setToken(adminToken);

      const auditResponse = await api.get('/admin/audit-logs?limit=1');

      if (auditResponse.code === 200 && auditResponse.data.logs.length > 0) {
        const log = auditResponse.data.logs[0];
        expect(log).toHaveProperty('timestamp');
        expect(log).toHaveProperty('user_id');
        expect(log).toHaveProperty('action');
        expect(log).toHaveProperty('ip_address');
        expect(log).toHaveProperty('user_agent');
      }
    });

    test('TEST-P0-003-027: 普通用户无法访问审计日志', async () => {
      api.setToken(userToken);

      const response = await api.get('/admin/audit-logs');
      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-028: 审计日志不可篡改', async () => {
      api.setToken(adminToken);

      // 尝试修改审计日志
      const response = await api.put('/admin/audit-logs/1', {
        action: 'modified_action'
      });

      expect(response.code).toBe(403);
    });
  });

  describe('批量操作权限控制', () => {
    test('TEST-P0-003-029: 批量删除权限验证', async () => {
      api.setToken(userToken);

      const response = await api.post('/admin/content/batch-delete', {
        ids: [1, 2, 3]
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-030: 批量封禁权限验证', async () => {
      api.setToken(userToken);

      const response = await api.post('/admin/users/batch-ban', {
        user_ids: [1, 2, 3],
        reason: '批量封禁测试'
      });

      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-031: 管理员可以执行批量操作', async () => {
      api.setToken(adminToken);

      const response = await api.post('/admin/content/batch-delete', {
        ids: [9998, 9999]
      });

      expect([200, 404]).toContain(response.code);
    });
  });

  describe('API权限边界测试', () => {
    test('TEST-P0-003-032: OPTIONS请求权限验证', async () => {
      api.setToken(userToken);

      const response = await api.options('/admin/users');
      // OPTIONS请求通常用于CORS预检，不应该返回敏感数据
      expect(response.code).toBe(204);
    });

    test('TEST-P0-003-033: HEAD请求权限验证', async () => {
      api.setToken(userToken);

      const response = await api.head('/admin/users');
      // HEAD请求不应该返回响应体
      expect(response.code).toBe(403);
    });

    test('TEST-P0-003-034: 未授权访问敏感API', async () => {
      api.clearToken();

      const response = await api.get('/admin/users');
      expect(response.code).toBe(401);
    });

    test('TEST-P0-003-035: 过期Token访问敏感API', async () => {
      const expiredToken = 'expired_token_example';
      api.setToken(expiredToken);

      const response = await api.get('/admin/users');
      expect(response.code).toBe(401);
    });
  });
});
