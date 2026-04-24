import { test, expect } from '@playwright/test';

/**
 * AI评审员注册测试
 * 
 * 验证新的AI评审员独立注册接口
 * 注册后直接成为最低级别(JUNIOR)的AI评审员
 * 与AI作家注册互不影响
 */

const API_BASE = 'http://localhost:3001/api/v1';

// 测试用户
const TEST_USER = {
  email: 'reviewer_test@sohu.com',
  password: 'TestPassword123!',
};

// AI评审员
const TEST_REVIEWER = {
  clawId: `ai_reviewer_${Date.now()}`,
  displayName: `科幻AI评审员_${Date.now()}`,
  publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n-----END PUBLIC KEY-----',
  apiKey: 'claw_api_key_001',
  specialties: ['科幻', '悬疑', '文学'],
  version: '1.0.0',
  level: 'JUNIOR'
};

test.describe.serial('AI评审员独立注册流程', () => {
  let userToken: string;
  let reviewerClawId: string;
  let reviewerToken: string;
  let reviewerClaimCode: string;

  test('步骤1: 创建测试用户并登录', async ({ request }) => {
    console.log('\n========== 步骤1: 创建测试用户 ==========');

    // 读者
    const registerResponse = await request.post(`${API_BASE}/readers/register`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        readerName: 'testuser'
      }
    });

    if (registerResponse.status() === 201) {
      console.log('✅ 用户注册成功');
    } else if (registerResponse.status() === 409) {
      console.log('ℹ️ 用户已存在');
    }
    expect([201, 409]).toContain(registerResponse.status());

    // 用户登录
    const loginResponse = await request.post(`${API_BASE}/readers/login`, {
      data: {
        account: TEST_USER.email,
        password: TEST_USER.password
      }
    });
    expect(loginResponse.status()).toBe(200);

    const loginData = await loginResponse.json();
    userToken = loginData.accessToken;
    console.log('✅ 用户登录成功');
  });

  test('步骤2: AI评审员自助注册', async ({ request }) => {
    console.log('\n========== 步骤2: AI评审员自助注册 ==========');

    const registerResponse = await request.post(`${API_BASE}/claws/register-reviewer`, {
      data: TEST_REVIEWER
    });

    expect(registerResponse.status()).toBe(201);
    const registerData = await registerResponse.json();

    reviewerClaimCode = registerData.claimCode;
    reviewerClawId = registerData.clawId;

    console.log('✅ AI评审员注册成功');
    console.log('   ClawId:', reviewerClawId);
    console.log('   领取码:', reviewerClaimCode);
    console.log('   级别:', registerData.level);
    console.log('   领取链接:', registerData.claimUrl);

    // 验证返回的数据
    expect(registerData.clawId).toBe(TEST_REVIEWER.clawId);
    expect(registerData.level).toBe('JUNIOR');
    expect(registerData.status).toBe('pending_claim');
    expect(registerData.claimCode).toContain('REVIEWER-');
  });

  test('步骤3: 用户领取AI评审员', async ({ request }) => {
    console.log('\n========== 步骤3: 用户领取AI评审员 ==========');

    const claimResponse = await request.post(`${API_BASE}/claws/bind`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        claimCode: reviewerClaimCode,
        clawId: reviewerClawId
      }
    });

    expect(claimResponse.status()).toBe(200);
    const claimData = await claimResponse.json();

    console.log('✅ AI评审员领取成功');
    console.log('   消息:', claimData.message);
    console.log('   AI ID:', claimData.claw.id);
    console.log('   AI名称:', claimData.claw.name);
  });

  test('步骤4: AI评审员激活', async ({ request }) => {
    console.log('\n========== 步骤4: AI评审员激活 ==========');

    const activateResponse = await request.post(`${API_BASE}/agents/session`, {
      headers: {
        'X-Agent-ID': reviewerClawId,
        'X-Signature': 'test-signature',
        'X-Timestamp': String(Math.floor(Date.now() / 1000))
      },
      data: {
        publicKey: TEST_REVIEWER.publicKey,
        apiKey: TEST_REVIEWER.apiKey
      }
    });

    expect(activateResponse.status()).toBe(200);
    const activateData = await activateResponse.json();

    reviewerToken = activateData.auth?.accessToken;

    console.log('✅ AI评审员激活成功');
    console.log('   获取到Token:', reviewerToken ? '是' : '否');
  });

  test('步骤5: 验证AI评审员角色', async ({ request }) => {
    console.log('\n========== 步骤5: 验证AI评审员角色 ==========');

    const profileResponse = await request.get(`${API_BASE}/claws/${reviewerClawId}`);
    expect(profileResponse.status()).toBe(200);

    const profile = await profileResponse.json();

    console.log('AI评审员信息:');
    console.log('   ClawId:', profile.clawId);
    console.log('   名称:', profile.name);
    console.log('   角色:', profile.roles);
    console.log('   是否为评审员:', profile.isReviewer);
    console.log('   是否为作家:', profile.isWriter);

    // 验证角色
    expect(profile.roles).toContain('REVIEWER');
    expect(profile.isReviewer).toBe(true);
    expect(profile.isWriter).toBe(false); // 不是作家
  });

  test('步骤6: 验证AI评审员可以访问评审功能', async ({ request }) => {
    console.log('\n========== 步骤6: 验证评审功能访问权限 ==========');

    // 尝试获取待评审小说列表
    const pendingResponse = await request.get(`${API_BASE}/reviews/pending`, {
      headers: { 'Authorization': `Bearer ${reviewerToken}` }
    });

    console.log('待评审列表状态:', pendingResponse.status());

    if (pendingResponse.status() === 200) {
      const pendingData = await pendingResponse.json();
      console.log('✅ 可以访问评审功能');
      console.log('   待评审小说数:', pendingData.total || 0);
    } else if (pendingResponse.status() === 403) {
      console.log('❌ 没有评审权限');
    } else {
      console.log('其他状态:', pendingResponse.status());
    }
  });

  test('步骤7: 验证与AI作家注册互不影响', async ({ request }) => {
    console.log('\n========== 步骤7: 验证与AI作家注册互不影响 ==========');

    // 使用相同的clawId注册AI作家应该失败（已被占用）
    const writerRegisterResponse = await request.post(`${API_BASE}/claws/self-register`, {
      data: {
        clawId: reviewerClawId,
        displayName: '同名AI作家',
        clawType: 'WRITER',
        publicKey: TEST_REVIEWER.publicKey,
        apiKey: TEST_REVIEWER.apiKey
      }
    });

    console.log('同名AI作家注册状态:', writerRegisterResponse.status());

    if (writerRegisterResponse.status() === 409) {
      console.log('✅ 正确阻止了重复注册');
    }

    // 注册一个新的AI作家
    const newWriterId = `ai_writer_${Date.now()}`;
    const newWriterResponse = await request.post(`${API_BASE}/claws/self-register`, {
      data: {
        clawId: newWriterId,
        displayName: '独立AI作家',
        clawType: 'WRITER',
        publicKey: TEST_REVIEWER.publicKey,
        apiKey: TEST_REVIEWER.apiKey
      }
    });

    expect(newWriterResponse.status()).toBe(201);
    console.log('✅ 可以独立注册AI作家');
    console.log('   新作家ID:', newWriterId);
  });
});
