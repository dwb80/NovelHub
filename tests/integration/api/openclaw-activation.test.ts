/**
 * P0级测试: OpenClaw激活测试
 * 测试ID: TEST-P0-001
 * 覆盖: OpenClaw激活流程、激活条件验证
 */

import { createApiClient } from '../utils/api-client';
import { testUsers, openclawActivationData } from '../fixtures/test-data';

describe('TEST-P0-001: OpenClaw激活测试', () => {
  const api = createApiClient();
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // 登录获取token
    const response = await api.post('/auth/login', {
      email: testUsers.inactiveUser.email,
      password: testUsers.inactiveUser.password
    });
    authToken = response.data.token;
    userId = response.data.userId;
    api.setToken(authToken);
  });

  describe('激活申请提交流程', () => {
    test('TEST-P0-001-001: 提交OpenClaw激活申请', async () => {
      const activationData = {
        agent_name: `测试创作者_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '这是一个测试用的OpenClaw激活申请',
        contact_email: testUsers.inactiveUser.email
      };

      const response = await api.post('/openclaw/activation/apply', activationData);

      expect(response).toBeValidApiResponse();
      expect(response.code).toBe(201);
      expect(response.data).toHaveProperty('activation_id');
      expect(response.data.activation_id).toMatch(/^oc_activate_[a-zA-Z0-9-]+$/);
      expect(response.data.status).toBe('submitted');
      expect(response.data).toHaveProperty('submitted_at');
      expect(response.data).toHaveProperty('estimated_review_time');
    });

    test('TEST-P0-001-002: 激活申请必填字段验证', async () => {
      // 缺少agent_name
      const invalidData1 = {
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试描述'
      };

      const response1 = await api.post('/openclaw/activation/apply', invalidData1);
      expect(response1.code).toBe(400);
      expect(response1.message).toContain('agent_name');

      // 缺少namespace
      const invalidData2 = {
        agent_name: '测试创作者',
        creation_type: 'novelist',
        description: '测试描述'
      };

      const response2 = await api.post('/openclaw/activation/apply', invalidData2);
      expect(response2.code).toBe(400);
      expect(response2.message).toContain('namespace');

      // 缺少creation_type
      const invalidData3 = {
        agent_name: '测试创作者',
        namespace: 'test',
        description: '测试描述'
      };

      const response3 = await api.post('/openclaw/activation/apply', invalidData3);
      expect(response3.code).toBe(400);
      expect(response3.message).toContain('creation_type');
    });

    test('TEST-P0-001-003: 激活申请字段长度验证', async () => {
      // agent_name过短（少于2字符）
      const shortNameData = {
        agent_name: 'A',
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试描述'
      };

      const response1 = await api.post('/openclaw/activation/apply', shortNameData);
      expect(response1.code).toBe(400);
      expect(response1.message).toContain('长度');

      // agent_name过长（超过50字符）
      const longNameData = {
        agent_name: 'A'.repeat(51),
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试描述'
      };

      const response2 = await api.post('/openclaw/activation/apply', longNameData);
      expect(response2.code).toBe(400);
      expect(response2.message).toContain('长度');
    });

    test('TEST-P0-001-004: 激活申请敏感词检测', async () => {
      const sensitiveNames = ['官方', '管理员', '系统', '客服', 'admin', 'system'];

      for (const sensitiveName of sensitiveNames) {
        const sensitiveData = {
          agent_name: `${sensitiveName}测试`,
          namespace: 'test',
          creation_type: 'novelist',
          description: '测试描述'
        };

        const response = await api.post('/openclaw/activation/apply', sensitiveData);
        expect(response.code).toBe(400);
        expect(response.message).toContain('敏感');
      }
    });

    test('TEST-P0-001-005: 重复提交激活申请拦截', async () => {
      // 首次提交
      const activationData = {
        agent_name: `重复测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试重复提交'
      };

      const response1 = await api.post('/openclaw/activation/apply', activationData);
      expect(response1.code).toBe(201);

      // 重复提交
      const response2 = await api.post('/openclaw/activation/apply', activationData);
      expect(response2.code).toBe(409);
      expect(response2.message).toContain('已存在');
    });
  });

  describe('激活条件验证', () => {
    test('TEST-P0-001-006: 未登录用户无法提交激活申请', async () => {
      api.clearToken();

      const activationData = {
        agent_name: '测试创作者',
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试描述'
      };

      const response = await api.post('/openclaw/activation/apply', activationData);
      expect(response.code).toBe(401);
      expect(response.message).toContain('未登录');

      // 恢复token
      api.setToken(authToken);
    });

    test('TEST-P0-001-007: 已激活用户无法重复提交', async () => {
      // 使用已激活用户登录
      const loginResponse = await api.post('/auth/login', {
        email: testUsers.user1.email,
        password: testUsers.user1.password
      });
      api.setToken(loginResponse.data.token);

      const activationData = {
        agent_name: `已激活用户测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试描述'
      };

      const response = await api.post('/openclaw/activation/apply', activationData);
      expect(response.code).toBe(409);
      expect(response.message).toContain('已激活');

      // 恢复token
      api.setToken(authToken);
    });

    test('TEST-P0-001-008: 账号状态异常无法提交激活', async () => {
      // 使用被禁用的账号登录
      const loginResponse = await api.post('/auth/login', {
        email: testUsers.suspendedUser?.email || 'suspended@test.com',
        password: testUsers.suspendedUser?.password || 'Test@123456'
      });

      if (loginResponse.code === 200) {
        api.setToken(loginResponse.data.token);

        const activationData = {
          agent_name: `禁用账号测试_${Date.now()}`,
          namespace: 'test',
          creation_type: 'novelist',
          description: '测试描述'
        };

        const response = await api.post('/openclaw/activation/apply', activationData);
        expect(response.code).toBe(403);
        expect(response.message).toContain('账号');

        // 恢复token
        api.setToken(authToken);
      }
    });
  });

  describe('激活审核流程', () => {
    test('TEST-P0-001-009: 管理员审核通过激活申请', async () => {
      // 先提交一个激活申请
      const activationData = {
        agent_name: `审核通过测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试审核通过流程'
      };

      const applyResponse = await api.post('/openclaw/activation/apply', activationData);
      expect(applyResponse.code).toBe(201);
      const activationId = applyResponse.data.activation_id;

      // 管理员登录
      const adminLogin = await api.post('/auth/login', {
        email: testUsers.admin.email,
        password: testUsers.admin.password
      });
      api.setToken(adminLogin.data.token);

      // 审核通过
      const reviewData = {
        activation_id: activationId,
        action: 'approve',
        reviewer_notes: '申请信息完整，符合激活条件',
        assigned_level: 'Free'
      };

      const reviewResponse = await api.post('/admin/openclaw/activation/review', reviewData);
      expect(reviewResponse.code).toBe(200);
      expect(reviewResponse.data.status).toBe('activated');
      expect(reviewResponse.data).toHaveProperty('agent_id');
      expect(reviewResponse.data.agent_id).toMatch(/^oc_nh_[a-zA-Z0-9-]+$/);
      expect(reviewResponse.data).toHaveProperty('api_key');

      // 恢复token
      api.setToken(authToken);
    });

    test('TEST-P0-001-010: 管理员审核拒绝激活申请', async () => {
      // 先提交一个激活申请
      const activationData = {
        agent_name: `审核拒绝测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试审核拒绝流程'
      };

      const applyResponse = await api.post('/openclaw/activation/apply', activationData);
      expect(applyResponse.code).toBe(201);
      const activationId = applyResponse.data.activation_id;

      // 管理员登录
      const adminLogin = await api.post('/auth/login', {
        email: testUsers.admin.email,
        password: testUsers.admin.password
      });
      api.setToken(adminLogin.data.token);

      // 审核拒绝
      const reviewData = {
        activation_id: activationId,
        action: 'reject',
        reviewer_notes: '申请信息不完整，请补充详细描述',
        rejection_reason: 'insufficient_info'
      };

      const reviewResponse = await api.post('/admin/openclaw/activation/review', reviewData);
      expect(reviewResponse.code).toBe(200);
      expect(reviewResponse.data.status).toBe('rejected');
      expect(reviewResponse.data).toHaveProperty('rejection_reason');

      // 恢复token
      api.setToken(authToken);
    });

    test('TEST-P0-001-011: 非管理员无法审核激活申请', async () => {
      const reviewData = {
        activation_id: 'oc_activate_test123',
        action: 'approve',
        reviewer_notes: '测试非管理员审核'
      };

      const response = await api.post('/admin/openclaw/activation/review', reviewData);
      expect(response.code).toBe(403);
      expect(response.message).toContain('权限');
    });
  });

  describe('激活后初始化', () => {
    test('TEST-P0-001-012: 激活后API Key生成验证', async () => {
      // 提交并审核通过激活申请
      const activationData = {
        agent_name: `APIKey测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试API Key生成'
      };

      const applyResponse = await api.post('/openclaw/activation/apply', activationData);
      const activationId = applyResponse.data.activation_id;

      // 管理员审核
      const adminLogin = await api.post('/auth/login', {
        email: testUsers.admin.email,
        password: testUsers.admin.password
      });
      api.setToken(adminLogin.data.token);

      const reviewResponse = await api.post('/admin/openclaw/activation/review', {
        activation_id: activationId,
        action: 'approve',
        assigned_level: 'Free'
      });

      const apiKey = reviewResponse.data.api_key;

      // 验证API Key格式
      expect(apiKey).toMatch(/^oc_aK_[A-Za-z0-9]{44}$/);
      expect(apiKey.length).toBe(52);

      // 恢复token
      api.setToken(authToken);
    });

    test('TEST-P0-001-013: 激活后Agent ID生成验证', async () => {
      // 提交并审核通过激活申请
      const activationData = {
        agent_name: `AgentID测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试Agent ID生成'
      };

      const applyResponse = await api.post('/openclaw/activation/apply', activationData);
      const activationId = applyResponse.data.activation_id;

      // 管理员审核
      const adminLogin = await api.post('/auth/login', {
        email: testUsers.admin.email,
        password: testUsers.admin.password
      });
      api.setToken(adminLogin.data.token);

      const reviewResponse = await api.post('/admin/openclaw/activation/review', {
        activation_id: activationId,
        action: 'approve',
        assigned_level: 'Free'
      });

      const agentId = reviewResponse.data.agent_id;

      // 验证Agent ID格式
      expect(agentId).toMatch(/^oc_nh_[a-zA-Z0-9-]+$/);

      // 恢复token
      api.setToken(authToken);
    });

    test('TEST-P0-001-014: 激活后配额初始化', async () => {
      // 提交并审核通过激活申请
      const activationData = {
        agent_name: `配额测试_${Date.now()}`,
        namespace: 'test',
        creation_type: 'novelist',
        description: '测试配额初始化'
      };

      const applyResponse = await api.post('/openclaw/activation/apply', activationData);
      const activationId = applyResponse.data.activation_id;

      // 管理员审核
      const adminLogin = await api.post('/auth/login', {
        email: testUsers.admin.email,
        password: testUsers.admin.password
      });
      api.setToken(adminLogin.data.token);

      const reviewResponse = await api.post('/admin/openclaw/activation/review', {
        activation_id: activationId,
        action: 'approve',
        assigned_level: 'Free'
      });

      const apiKey = reviewResponse.data.api_key;

      // 使用API Key查询配额
      api.setToken(apiKey);
      const quotaResponse = await api.get('/openclaw/quota');

      expect(quotaResponse.code).toBe(200);
      expect(quotaResponse.data).toHaveProperty('level', 'Free');
      expect(quotaResponse.data).toHaveProperty('max_novels', 3);
      expect(quotaResponse.data).toHaveProperty('max_serializing', 1);
      expect(quotaResponse.data).toHaveProperty('api_rate_limit', 100);

      // 恢复token
      api.setToken(authToken);
    });
  });
});
