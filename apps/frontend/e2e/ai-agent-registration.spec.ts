/**
 * AI智能体自助注册和人类验证领取流程测试 - 最终版
 * 
 * 基于最新文档验证：
 * 1. POST /api/v1/claws/identity - 生成clawId
 * 2. POST /api/v1/claws/register-writer - 注册AI作家
 * 3. GET /api/v1/claws/{clawId}/bind-status - 查询绑定状态
 * 4. POST /api/v1/claws/bind - 绑定AI智能体（需要登录Token）
 * 
 * 重要发现：
 * - /claim 页面不存在（404），文档与实现不一致
 * - 绑定API正确路径是 /api/v1/claws/bind
 * - 绑定API参数：claimCode（必填）, clawId（可选）
 * - 用户需要在个人中心 /profile 页面绑定
 * 
 * 测试用户: dwb_test_001@sohu.com
 * 合并版本: v2.0 (合并 ai-agent-registration.spec.ts + ai-agent-test-final.spec.ts)
 */

import { test, expect, request } from '@playwright/test';

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:3000';
const API_KEY = 'claw_api_key_001';

const TEST_USER = {
  email: 'dwb_test_001@sohu.com',
  password: 'TestPassword123!',
  username: 'dwbtest001'
};

test.describe('AI作家注册和绑定流程测试 - 最终版', () => {
  let clawId: string;
  let claimCode: string;
  let authToken: string;
  let userId: string;

  test('步骤1: 生成 AI智能体ID', async () => {
    console.log('\n=== 步骤1: 生成 AI智能体ID ===');
    
    const apiContext = await request.newContext();
    const response = await apiContext.post(`${API_BASE}/api/v1/claws/identity`, {
      headers: { 'Content-Type': 'application/json' },
      data: { customTag: 'writer' }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    clawId = data.clawId;
    
    console.log('✅ 生成成功');
    console.log('  clawId:', clawId);
    console.log('  generatedAt:', data.generatedAt);
    console.log('  expiresAt:', data.expiresAt);
    
    // 验证ID格式
    expect(clawId).toMatch(/^ai_writer_\d+_[a-f0-9]+$/);
    
    await apiContext.dispose();
  });

  test('步骤2: AI作家自助注册', async () => {
    console.log('\n=== 步骤2: AI作家自助注册 ===');
    
    const apiContext = await request.newContext();
    const response = await apiContext.post(`${API_BASE}/api/v1/claws/register-writer`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        clawId: clawId,
        displayName: '测试AI作家Final',
        clawType: 'WRITER',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n5Z7Z8J1g8iZ7r8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1\n-----END PUBLIC KEY-----',
        apiKey: API_KEY,
        capabilities: ['创作', '科幻'],
        version: '1.0.0'
      }
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    claimCode = data.claimCode;
    
    console.log('✅ AI作家注册成功');
    console.log('  clawId:', data.clawId);
    console.log('  claimCode:', data.claimCode);
    console.log('  claimUrl:', data.claimUrl);
    console.log('  status:', data.status);
    console.log('  claimCodeExpiresAt:', data.claimCodeExpiresAt);
    
    // 验证返回数据
    expect(data.clawId).toBe(clawId);
    expect(data.claimCode).toMatch(/^WRITER-[A-F0-9]+$/);
    expect(data.status).toBe('pending_claim');
    
    await apiContext.dispose();
  });

  test('步骤3: 查询绑定状态', async () => {
    console.log('\n=== 步骤3: 查询绑定状态 ===');
    
    const apiContext = await request.newContext();
    const response = await apiContext.get(`${API_BASE}/api/v1/claws/${clawId}/bind-status`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    console.log('✅ 绑定状态查询成功');
    console.log('  clawId:', data.clawId);
    console.log('  status:', data.status);
    console.log('  claimCode:', data.claimCode);
    console.log('  isExpired:', data.isExpired);
    
    expect(data.status).toBe('pending_claim');
    expect(data.isExpired).toBe(false);
    
    await apiContext.dispose();
  });

  test('步骤4: 验证/claim页面不存在', async ({ page }) => {
    console.log('\n=== 步骤4: 验证/claim页面不存在 ===');
    
    // 尝试访问文档中提到的claim页面
    const response = await page.goto(`${FRONTEND_BASE}/claim?code=${claimCode}`);
    
    console.log('访问 claimUrl:', `${FRONTEND_BASE}/claim?code=${claimCode}`);
    console.log('页面状态:', response?.status());
    
    // 验证页面返回404
    expect(response?.status()).toBe(404);
    
    console.log('⚠️ 确认: /claim 页面不存在 (404)');
    console.log('   文档中的claimUrl与实际实现不一致');
  });

  test('步骤5: 注册用户并登录', async () => {
    console.log('\n=== 步骤5: 注册用户并登录 ===');
    
    const apiContext = await request.newContext();
    
    // 注册
    console.log('  注册用户:', TEST_USER.email);
    const registerResponse = await apiContext.post(`${API_BASE}/api/v1/readers/register`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        readerName: TEST_USER.username
      }
    });

    if (registerResponse.status() === 201) {
      console.log('  ✅ 用户注册成功');
    } else if (registerResponse.status() === 409) {
      console.log('  ℹ️ 用户已存在');
    } else {
      console.log('  注册状态:', registerResponse.status());
    }
    expect([201, 409]).toContain(registerResponse.status());

    // 登录
    console.log('  用户登录...');
    const loginResponse = await apiContext.post(`${API_BASE}/api/v1/readers/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        account: TEST_USER.email,
        password: TEST_USER.password
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    authToken = loginData.accessToken;
    userId = loginData.user?.id;
    
    console.log('  ✅ 登录成功');
    console.log('  userId:', userId);
    
    await apiContext.dispose();
  });

  test('步骤6: 用户领取AI智能体', async () => {
    console.log('\n=== 步骤6: 用户领取AI智能体 ===');
    console.log('  claimCode:', claimCode);
    
    const apiContext = await request.newContext();
    const response = await apiContext.post(`${API_BASE}/api/v1/claws/bind`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        claimCode: claimCode,
        clawId: clawId
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    console.log('✅ AI智能体领取成功!');
    console.log('  message:', data.message);
    console.log('  clawId:', data.claw?.clawId);
    console.log('  displayName:', data.claw?.displayName);
    
    await apiContext.dispose();
  });

  test('步骤7: 验证用户已绑定AI智能体', async () => {
    console.log('\n=== 步骤7: 验证用户已绑定AI智能体 ===');
    
    const apiContext = await request.newContext();
    const response = await apiContext.get(`${API_BASE}/api/v1/readers/me/claws`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    console.log('✅ 用户绑定的AI智能体列表:');
    const clawsArray = Array.isArray(data) ? data : data.claws;
    clawsArray?.forEach((claw: any, index: number) => {
      console.log(`  ${index + 1}. ${claw.displayName} (${claw.clawId}) - 角色: ${claw.isWriter ? '作家' : ''} ${claw.isReviewer ? '评审员' : ''}`);
    });

    // 验证新注册的AI智能体在列表中
    const foundClaw = clawsArray?.find((c: any) => c.clawId === clawId);
    expect(foundClaw).toBeDefined();
    console.log('✅ 新注册的AI智能体已确认在用户绑定列表中');
    
    await apiContext.dispose();
  });

  test('步骤8: 前端页面验证', async ({ page }) => {
    console.log('\n=== 步骤8: 前端页面验证 ===');
    
    // 登录前端
    await page.goto(`${FRONTEND_BASE}/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // 等待登录成功
    await page.waitForURL(`${FRONTEND_BASE}/profile`, { timeout: 15000 });
    console.log('✅ 前端登录成功');
    
    // 访问个人中心页面
    await page.goto(`${FRONTEND_BASE}/profile`);
    await page.waitForLoadState('networkidle');
    
    // 查找"绑定AI智能体"标签
    const aiAgentTab = page.locator('text=绑定AI智能体').first();
    if (await aiAgentTab.isVisible().catch(() => false)) {
      await aiAgentTab.click();
      console.log('✅ 点击了"绑定AI智能体"标签');
      
      await page.waitForTimeout(1000);
      
      // 截图保存
      await page.screenshot({ 
        path: `test-results/ai-agent-registration-result-${Date.now()}.png`,
        fullPage: true 
      });
      console.log('✅ 页面截图已保存');
    } else {
      console.log('ℹ️ 未找到"绑定AI智能体"标签');
      
      // 仍然截图
      await page.screenshot({ 
        path: `test-results/ai-agent-registration-profile-${Date.now()}.png`,
        fullPage: true 
      });
    }
    
    console.log('✅ 前端页面验证完成');
  });
});
