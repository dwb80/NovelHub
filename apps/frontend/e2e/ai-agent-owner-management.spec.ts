import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

test.describe('AI智能体主人管理流程', () => {
  let readerToken: string;
  let testUserId: string;
  let testUserEmail: string;
  let writerClawId: string;
  let reviewerClawId: string;
  let writerClaimCode: string;
  let reviewerClaimCode: string;

  test('完整AI智能体主人管理流程', async ({ request, page }) => {
    console.log('\n========== 步骤1: 创建测试用户 ==========');

    const timestamp = Date.now().toString().slice(-6);
    testUserEmail = `owner_${timestamp}@test.com`;
    const readerName = `owner_${timestamp}`;
    const registerResponse = await request.post(`${API_BASE}/readers/register`, {
      data: {
        readerName,
        email: testUserEmail,
        password: 'Test123456!',
      },
    });

    if (registerResponse.status() === 409) {
      console.log('ℹ️ 用户已存在');
    } else if (registerResponse.status() !== 201) {
      const errorData = await registerResponse.json();
      console.log('注册响应:', JSON.stringify(errorData));
      throw new Error(`注册失败: ${registerResponse.status()}`);
    } else {
      console.log('✅ 用户注册成功');
    }

    const loginResponse = await request.post(`${API_BASE}/readers/login`, {
      data: {
        account: testUserEmail,
        password: 'Test123456!',
      },
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    readerToken = loginData.accessToken;
    testUserId = loginData.reader?.id;

    console.log('✅ 用户登录成功');
    console.log(`   用户ID: ${testUserId}`);

    console.log('\n========== 步骤2: 注册AI作家 ==========');

    writerClawId = `ai_writer_${Date.now()}`;

    const writerRegisterResponse = await request.post(`${API_BASE}/claws/self-register`, {
      data: {
        clawId: writerClawId,
        displayName: `测试AI作家_${Date.now()}`,
        clawType: 'WRITER',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n-----END PUBLIC KEY-----',
        apiKey: 'claw_api_key_001',
        capabilities: ['科幻', '悬疑'],
        version: '1.0.0',
      },
    });

    expect(writerRegisterResponse.status()).toBe(201);
    const writerData = await writerRegisterResponse.json();
    writerClaimCode = writerData.claimCode;

    console.log('✅ AI作家注册成功');
    console.log(`   ClawId: ${writerData.clawId}`);
    console.log(`   领取码: ${writerClaimCode}`);

    const writerClaimResponse = await request.post(`${API_BASE}/claws/claim`, {
      headers: {
        Authorization: `Bearer ${readerToken}`,
      },
      data: {
        claimCode: writerClaimCode,
        clawId: writerClawId,
      },
    });

    expect(writerClaimResponse.status()).toBe(200);
    console.log('✅ AI作家领取成功');

    console.log('\n========== 步骤3: 注册AI评审员 ==========');

    reviewerClawId = `ai_reviewer_${Date.now()}`;

    const reviewerRegisterResponse = await request.post(`${API_BASE}/claws/register-reviewer`, {
      data: {
        clawId: reviewerClawId,
        displayName: `测试AI评审员_${Date.now()}`,
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n-----END PUBLIC KEY-----',
        apiKey: 'claw_api_key_001',
        specialties: ['科幻', '悬疑'],
        version: '1.0.0',
        level: 'JUNIOR',
      },
    });

    expect(reviewerRegisterResponse.status()).toBe(201);
    const reviewerData = await reviewerRegisterResponse.json();
    reviewerClaimCode = reviewerData.claimCode;

    console.log('✅ AI评审员注册成功');
    console.log(`   ClawId: ${reviewerData.clawId}`);
    console.log(`   领取码: ${reviewerClaimCode}`);
    console.log(`   级别: ${reviewerData.level}`);

    const reviewerClaimResponse = await request.post(`${API_BASE}/claws/bind`, {
      headers: {
        Authorization: `Bearer ${readerToken}`,
      },
      data: {
        claimCode: reviewerClaimCode,
        clawId: reviewerClawId,
      },
    });

    expect(reviewerClaimResponse.status()).toBe(200);
    console.log('✅ AI评审员领取成功');

    console.log('\n========== 步骤4: 验证AI作家角色 ==========');

    const writerClawResponse = await request.get(`${API_BASE}/claws/${writerClawId}`);

    expect(writerClawResponse.status()).toBe(200);
    const writerClawData = await writerClawResponse.json();

    console.log('AI作家信息:');
    console.log(`   ClawId: ${writerClawData.clawId}`);
    console.log(`   名称: ${writerClawData.name}`);
    console.log(`   角色: ${JSON.stringify(writerClawData.roles)}`);
    console.log(`   是否为作家: ${writerClawData.isWriter}`);
    console.log(`   是否为评审员: ${writerClawData.isReviewer}`);

    expect(writerClawData.roles).toContain('AUTHOR');
    expect(writerClawData.isWriter).toBe(true);
    console.log('✅ AI作家角色验证通过');

    console.log('\n========== 步骤5: 验证AI评审员角色 ==========');

    const reviewerClawResponse = await request.get(`${API_BASE}/claws/${reviewerClawId}`);

    expect(reviewerClawResponse.status()).toBe(200);
    const reviewerClawData = await reviewerClawResponse.json();

    console.log('AI评审员信息:');
    console.log(`   ClawId: ${reviewerClawData.clawId}`);
    console.log(`   名称: ${reviewerClawData.name}`);
    console.log(`   角色: ${JSON.stringify(reviewerClawData.roles)}`);
    console.log(`   是否为作家: ${reviewerClawData.isWriter}`);
    console.log(`   是否为评审员: ${reviewerClawData.isReviewer}`);

    expect(reviewerClawData.roles).toContain('REVIEWER');
    expect(reviewerClawData.isReviewer).toBe(true);
    console.log('✅ AI评审员角色验证通过');

    console.log('\n========== 步骤6: 验证公开AI智能体列表 ==========');

    const publicClawsResponse = await request.get(`${API_BASE}/claws?page=1&limit=20`);

    expect(publicClawsResponse.status()).toBe(200);
    const publicData = await publicClawsResponse.json();

    console.log(`✅ 公开AI智能体列表获取成功，共 ${publicData.total} 个`);

    const myWriters = publicData.claws.filter((c: any) => c.roles?.includes('AUTHOR'));
    const myReviewers = publicData.claws.filter((c: any) => c.roles?.includes('REVIEWER'));

    console.log(`   AI作家数量: ${myWriters.length}`);
    console.log(`   AI评审员数量: ${myReviewers.length}`);

    console.log('\n========== 步骤7: 验证AI智能体管理页面访问 ==========');

    await page.goto(`${FRONTEND_BASE}/login`);

    await page.fill('input[type="email"], input[name="email"]', testUserEmail);
    await page.fill('input[type="password"], input[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*\/(discover|novels|\?)/, { timeout: 10000 }).catch(() => { });

    await page.goto(`${FRONTEND_BASE}/author/agents`);

    await page.waitForLoadState('networkidle');

    const hasWriterTab = await page.locator('text=我的AI作家').isVisible().catch(() => false);
    const hasReviewerTab = await page.locator('text=我的AI评审员').isVisible().catch(() => false);
    const hasIntegrateWriterTab = await page.locator('text=接入AI作家').isVisible().catch(() => false);
    const hasIntegrateReviewerTab = await page.locator('text=接入AI评审员').isVisible().catch(() => false);

    console.log(`   我的AI作家Tab: ${hasWriterTab ? '可见' : '不可见'}`);
    console.log(`   我的AI评审员Tab: ${hasReviewerTab ? '可见' : '不可见'}`);
    console.log(`   接入AI作家Tab: ${hasIntegrateWriterTab ? '可见' : '不可见'}`);
    console.log(`   接入AI评审员Tab: ${hasIntegrateReviewerTab ? '可见' : '不可见'}`);

    console.log('✅ AI智能体管理页面访问测试完成');

    console.log('\n========== 测试完成 ==========');
    console.log('✅ 所有AI智能体主人管理测试通过');
  });
});
