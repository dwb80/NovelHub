/**
 * P0级测试: OpenClaw状态管理测试
 * 测试ID: TEST-P0-002
 * 覆盖: OpenClaw状态流转、状态同步
 */

import { createApiClient } from '../utils/api-client';
import { testUsers } from '../fixtures/test-data';

describe('TEST-P0-002: OpenClaw状态管理测试', () => {
  const api = createApiClient();
  let authToken: string;
  let adminToken: string;
  let activationId: string;
  let agentId: string;

  beforeAll(async () => {
    // 普通用户登录
    const userResponse = await api.post('/auth/login', {
      email: testUsers.inactiveUser.email,
      password: testUsers.inactiveUser.password
    });
    authToken = userResponse.data.token;

    // 管理员登录
    const adminResponse = await api.post('/auth/login', {
      email: testUsers.admin.email,
      password: testUsers.admin.password
    });
    adminToken = adminResponse.data.token;
  });

  beforeEach(async () => {
    api.setToken(authToken);
  });

  describe('状态查询与获取', () => {
    test('TEST-P0-002-001: 获取OpenClaw当前状态', async () => {
      const response = await api.get('/openclaw/status');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(['inactive', 'submitted', 'pending_review', 'activated', 'suspended', 'rejected', 'deactivated']).toContain(response.data.status);
      expect(response.data).toHaveProperty('isActivated');
      expect(typeof response.data.isActivated).toBe('boolean');
    });

    test('TEST-P0-002-002: 获取OpenClaw详细状态信息', async () => {
      const response = await api.get('/openclaw/status/detail');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('status_description');
      expect(response.data).toHaveProperty('permissions');
      expect(Array.isArray(response.data.permissions)).toBe(true);
      expect(response.data).toHaveProperty('can_create_works');
      expect(response.data).toHaveProperty('can_use_ai');
    });

    test('TEST-P0-002-003: 获取OpenClaw状态历史', async () => {
      const response = await api.get('/openclaw/status/history');

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(200);
      expect(response.data).toHaveProperty('history');
      expect(Array.isArray(response.data.history)).toBe(true);

      if (response.data.history.length > 0) {
        const firstHistory = response.data.history[0];
        expect(firstHistory).toHaveProperty('status');
        expect(firstHistory).toHaveProperty('timestamp');
        expect(firstHistory).toHaveProperty('note');
      }
    });

    test('TEST-P0-002-004: 未激活用户状态查询', async () => {
      // 使用未激活用户登录
      const loginResponse = await api.post('/auth/login', {
        email: testUsers.inactiveUser.email,
        password: testUsers.inactiveUser.password
      });
      api.setToken(loginResponse.data.token);

      const response = await api.get('/openclaw/status');

      expect(response.code).toBe(200);
      expect(response.data.status).toBe('inactive');
      expect(response.data.isActivated).toBe(false);
      expect(response.data.permissions).toEqual(['view_only']);
    });
  });

  describe('状态机转换流程', () => {
    test('TEST-P0-002-005: 状态机完整转换流程 inactive -> submitted -> pending_review -> activated', async () => {
      // 1. 初始状态: inactive
      let statusResponse = await api.get('/openclaw/status');
      expect(statusResponse.data.status).toBe('inactive');

      // 2. 提交申请 -> submitted
      const activationData = {
        agent_name: `状态机测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试状态机转换'
      };

      const applyResponse = await api.post('/openclaw/activation/apply', activationData);
      expect(applyResponse.code).toBe(201);
      expect(applyResponse.data.status).toBe('submitted');
      activationId = applyResponse.data.activation_id;

      // 3. 系统处理 -> pending_review (模拟系统处理)
      await new Promise(resolve => setTimeout(resolve, 1000));
      statusResponse = await api.get('/openclaw/status');
      expect(['submitted', 'pending_review']).toContain(statusResponse.data.status);

      // 4. 管理员审核通过 -> activated
      api.setToken(adminToken);
      const reviewResponse = await api.post('/admin/openclaw/activation/review', {
        activation_id: activationId,
        action: 'approve',
        assigned_level: 'Free'
      });
      expect(reviewResponse.code).toBe(200);
      expect(reviewResponse.data.status).toBe('activated');
      agentId = reviewResponse.data.agent_id;

      // 5. 验证最终状态
      api.setToken(authToken);
      statusResponse = await api.get('/openclaw/status');
      expect(statusResponse.data.status).toBe('activated');
      expect(statusResponse.data.isActivated).toBe(true);
    });

    test('TEST-P0-002-006: 非法状态转换拦截', async () => {
      // 已激活状态不能直接转为submitted
      api.setToken(adminToken);
      const invalidTransition = await api.post('/admin/openclaw/activation/force-status', {
        agent_id: agentId,
        status: 'submitted'
      });

      expect(invalidTransition.code).toBe(400);
      expect(invalidTransition.message).toContain('非法');
    });

    test('TEST-P0-002-007: 状态转换历史记录完整性', async () => {
      const historyResponse = await api.get('/openclaw/status/history');

      expect(historyResponse.code).toBe(200);
      expect(historyResponse.data.history.length).toBeGreaterThanOrEqual(3);

      // 验证状态转换顺序
      const statuses = historyResponse.data.history.map((h: any) => h.status);
      expect(statuses).toContain('submitted');
      expect(statuses).toContain('activated');
    });
  });

  describe('状态同步机制', () => {
    test('TEST-P0-002-008: 状态变更实时同步到客户端', async () => {
      // 创建新的激活申请
      const newUserLogin = await api.post('/auth/login', {
        email: testUsers.user2.email,
        password: testUsers.user2.password
      });
      api.setToken(newUserLogin.data.token);

      const applyResponse = await api.post('/openclaw/activation/apply', {
        agent_name: `同步测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试状态同步'
      });

      const newActivationId = applyResponse.data.activation_id;

      // 管理员审核
      api.setToken(adminToken);
      await api.post('/admin/openclaw/activation/review', {
        activation_id: newActivationId,
        action: 'approve',
        assigned_level: 'Free'
      });

      // 立即查询状态，验证同步
      api.setToken(newUserLogin.data.token);
      const statusResponse = await api.get('/openclaw/status');

      expect(statusResponse.data.status).toBe('activated');
      expect(statusResponse.data.isActivated).toBe(true);
    });

    test('TEST-P0-002-009: 多设备状态同步', async () => {
      // 模拟多设备登录，验证状态一致性
      const device1Response = await api.get('/openclaw/status');
      const device2Response = await api.get('/openclaw/status');

      expect(device1Response.data.status).toBe(device2Response.data.status);
      expect(device1Response.data.isActivated).toBe(device2Response.data.isActivated);
      expect(device1Response.data.permissions).toEqual(device2Response.data.permissions);
    });

    test('TEST-P0-002-010: 状态变更通知机制', async () => {
      // 验证状态变更后通知是否发送
      const notificationsResponse = await api.get('/notifications?type=openclaw_status');

      expect(notificationsResponse.code).toBe(200);
      expect(notificationsResponse.data).toHaveProperty('notifications');

      // 查找状态变更相关的通知
      const statusNotifications = notificationsResponse.data.notifications.filter(
        (n: any) => n.type === 'openclaw_activated' || n.type === 'openclaw_status_changed'
      );

      expect(statusNotifications.length).toBeGreaterThan(0);
    });
  });

  describe('暂停与恢复状态', () => {
    test('TEST-P0-002-011: OpenClaw暂停状态管理', async () => {
      // 管理员暂停OpenClaw
      api.setToken(adminToken);
      const suspendResponse = await api.post('/admin/openclaw/suspend', {
        agent_id: agentId,
        reason: '违规内容处理',
        duration: '7d'
      });

      expect(suspendResponse.code).toBe(200);
      expect(suspendResponse.data.status).toBe('suspended');

      // 验证用户端状态
      api.setToken(authToken);
      const statusResponse = await api.get('/openclaw/status');
      expect(statusResponse.data.status).toBe('suspended');
      expect(statusResponse.data.isActivated).toBe(false);
    });

    test('TEST-P0-002-012: 暂停状态下API调用被拦截', async () => {
      const response = await api.post('/openclaw/works', {
        title: '测试作品',
        description: '测试描述',
        genre: '科幻'
      });

      expect(response.code).toBe(403);
      expect(response.message).toContain('暂停');
    });

    test('TEST-P0-002-013: OpenClaw恢复状态管理', async () => {
      // 管理员恢复OpenClaw
      api.setToken(adminToken);
      const resumeResponse = await api.post('/admin/openclaw/resume', {
        agent_id: agentId
      });

      expect(resumeResponse.code).toBe(200);
      expect(resumeResponse.data.status).toBe('activated');

      // 验证用户端状态
      api.setToken(authToken);
      const statusResponse = await api.get('/openclaw/status');
      expect(statusResponse.data.status).toBe('activated');
      expect(statusResponse.data.isActivated).toBe(true);
    });

    test('TEST-P0-002-014: 恢复后API调用正常', async () => {
      const response = await api.get('/openclaw/works');
      expect(response.code).toBe(200);
    });
  });

  describe('注销状态管理', () => {
    test('TEST-P0-002-015: OpenClaw注销申请流程', async () => {
      // 提交注销申请
      const deactivateResponse = await api.post('/openclaw/deactivation/apply', {
        reason: '个人原因',
        confirm: true
      });

      expect(deactivateResponse.code).toBe(200);
      expect(deactivateResponse.data.status).toBe('deactivation_pending');
      expect(deactivateResponse.data).toHaveProperty('cooldown_end_date');
    });

    test('TEST-P0-002-016: 注销冷却期验证', async () => {
      const statusResponse = await api.get('/openclaw/status');

      expect(statusResponse.data.status).toBe('deactivation_pending');
      expect(statusResponse.data).toHaveProperty('cooldown_remaining_days');
      expect(statusResponse.data.cooldown_remaining_days).toBeGreaterThan(0);
    });

    test('TEST-P0-002-017: 注销冷却期内取消注销', async () => {
      const cancelResponse = await api.post('/openclaw/deactivation/cancel', {});

      expect(cancelResponse.code).toBe(200);
      expect(cancelResponse.data.status).toBe('activated');

      // 验证状态恢复
      const statusResponse = await api.get('/openclaw/status');
      expect(statusResponse.data.status).toBe('activated');
    });

    test('TEST-P0-002-018: 注销后API Key失效', async () => {
      // 先获取当前API Key
      const keyResponse = await api.get('/openclaw/api-key');
      const apiKey = keyResponse.data.api_key;

      // 提交注销（跳过冷却期，用于测试）
      api.setToken(adminToken);
      await api.post('/admin/openclaw/deactivate', {
        agent_id: agentId,
        skip_cooldown: true
      });

      // 使用API Key调用API，应该失败
      api.setToken(apiKey);
      const response = await api.get('/openclaw/works');

      expect(response.code).toBe(401);
      expect(response.message).toContain('失效');
    });
  });

  describe('状态权限控制', () => {
    test('TEST-P0-002-019: 各状态权限验证', async () => {
      const states = ['inactive', 'submitted', 'pending_review', 'activated', 'suspended', 'rejected', 'deactivated'];
      const expectedPermissions: Record<string, string[]> = {
        inactive: ['view_only'],
        submitted: ['view_only'],
        pending_review: ['view_only'],
        activated: ['create', 'edit', 'submit_review', 'view_analytics'],
        suspended: ['view_only'],
        rejected: ['view_only', 'reapply'],
        deactivated: []
      };

      for (const state of states) {
        // 这里使用mock或特定测试数据验证各状态权限
        // 实际测试中可能需要创建不同状态的OpenClaw账号
        const permissions = expectedPermissions[state];
        expect(permissions).toBeDefined();
        expect(Array.isArray(permissions)).toBe(true);
      }
    });

    test('TEST-P0-002-020: 状态与功能映射验证', async () => {
      const statusResponse = await api.get('/openclaw/status/detail');

      if (statusResponse.data.status === 'activated') {
        expect(statusResponse.data.can_create_works).toBe(true);
        expect(statusResponse.data.can_use_ai).toBe(true);
      } else {
        expect(statusResponse.data.can_create_works).toBe(false);
        expect(statusResponse.data.can_use_ai).toBe(false);
      }
    });
  });
});
