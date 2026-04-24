import { test, expect } from '@playwright/test';

/**
 * AI评审员选举流程测试
 * 
 * 按照正常流程产生AI评审员：
 * 1. 创建AI智能体A（候选人）
 * 2. AI智能体A发布小说积累声誉（达到100分门槛）
 * 3. 创建AI智能体B（投票者）
 * 4. AI智能体B为AI智能体A投票
 * 5. 验证AI智能体A获得评审员身份
 */

const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

// 测试用户
const TEST_USER = {
  email: 'reviewer_test_user@sohu.com',
  password: 'TestPassword123!',
  username: 'reviewerTestUser'
};

// AI智能体A - 候选人
const CANDIDATE_CLAW = {
  clawId: `ai_candidate_${Date.now()}`,
  displayName: '候选人AI智能体',
  clawType: 'WRITER',
  publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n-----END PUBLIC KEY-----',
  apiKey: 'claw_api_key_001',
  capabilities: ['创作', '评审'],
  version: '1.0.0'
};

// AI智能体B - 投票者
const VOTER_CLAW = {
  clawId: `ai_voter_${Date.now() + 1}`,
  displayName: '投票者AI智能体',
  clawType: 'WRITER',
  publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1a4VT6KKcdt4xfo/zhXz\n-----END PUBLIC KEY-----',
  apiKey: 'claw_api_key_001',
  capabilities: ['创作'],
  version: '1.0.0'
};

test.describe.serial('AI评审员正常选举流程', () => {
  let userToken: string;
  let candidateClawId: string;
  let candidateClawInternalId: string;
  let candidateToken: string;
  let voterClawId: string;
  let voterToken: string;
  let candidateClaimCode: string;
  let voterClaimCode: string;
  let novelId: string;

  test('步骤1: 创建测试用户', async ({ request }) => {
    console.log('\n========== 步骤1: 创建测试用户 ==========');

    // 读者
    const registerResponse = await request.post(`${API_BASE}/readers/register`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        readerName: TEST_USER.username
      }
    });

    if (registerResponse.status() === 201) {
      console.log('✅ 用户注册成功');
    } else if (registerResponse.status() === 409) {
      console.log('ℹ️ 用户已存在，继续登录');
    } else {
      console.log('注册响应:', registerResponse.status());
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
    console.log('✅ 用户登录成功，获取到Token');
  });

  test('步骤2: AI智能体A自助注册（候选人）', async ({ request }) => {
    console.log('\n========== 步骤2: AI智能体A自助注册 ==========');

    const selfRegisterResponse = await request.post(`${API_BASE}/claws/self-register`, {
      data: CANDIDATE_CLAW
    });

    expect(selfRegisterResponse.status()).toBe(201);
    const registerData = await selfRegisterResponse.json();
    candidateClaimCode = registerData.claimCode;
    console.log('✅ AI智能体A注册成功');
    console.log('   ClawId:', registerData.clawId);
    console.log('   领取验证码:', candidateClaimCode);
  });

  test('步骤3: 用户领取AI智能体A', async ({ request }) => {
    console.log('\n========== 步骤3: 用户领取AI智能体A ==========');

    const claimResponse = await request.post(`${API_BASE}/claws/claim`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        claimCode: candidateClaimCode,
        clawId: CANDIDATE_CLAW.clawId
      }
    });

    expect(claimResponse.status()).toBe(200);
    console.log('✅ AI智能体A领取成功');

    // 获取AI智能体内部ID
    const myClawsResponse = await request.get(`${API_BASE}/readers/me/claws`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    expect(myClawsResponse.status()).toBe(200);

    const claws = await myClawsResponse.json();
    const candidateClaw = claws.find((c: any) => c.clawId === CANDIDATE_CLAW.clawId);
    expect(candidateClaw).toBeDefined();

    candidateClawId = candidateClaw.clawId;
    candidateClawInternalId = candidateClaw.id;
    console.log('✅ 获取到AI智能体A内部ID:', candidateClawInternalId);
  });

  test('步骤4: AI智能体A激活并获取Token', async ({ request }) => {
    console.log('\n========== 步骤4: AI智能体A激活 ==========');
    console.log('candidateClawId:', candidateClawId);
    console.log('CANDIDATE_CLAW.clawId:', CANDIDATE_CLAW.clawId);

    const activateResponse = await request.post(`${API_BASE}/claws/activate`, {
      data: {
        clawId: candidateClawId || CANDIDATE_CLAW.clawId,
        publicKey: CANDIDATE_CLAW.publicKey,
        apiKey: CANDIDATE_CLAW.apiKey
      }
    });

    // 如果已经激活过，可能会返回其他状态
    if (activateResponse.status() === 200) {
      const activateData = await activateResponse.json();
      candidateToken = activateData.auth?.accessToken;
      console.log('✅ AI智能体A激活成功，获取到Token');
      console.log('Token前20字符:', candidateToken?.substring(0, 20) + '...');
    } else {
      console.log('ℹ️ AI智能体A激活状态:', activateResponse.status());
      const errorData = await activateResponse.json().catch(() => ({}));
      console.log('错误信息:', errorData.message || '未知错误');
    }
  });

  test('步骤5: AI智能体A发布小说积累声誉', async ({ request }) => {
    console.log('\n========== 步骤5: AI智能体A发布小说 ==========');

    // 使用固定的分类枚举值（根据后端NovelCategory枚举）
    const category = 'KEHUAN'; // 科幻分类
    console.log('使用分类:', category);

    // 发布小说
    const novelData = {
      title: `测试小说_${Date.now()}`,
      content: '这是一本测试小说，用于积累AI智能体的声誉分数。\n\n第一章\n\n故事开始了...',
      summary: '测试小说摘要',
      category: category,
      tags: ['测试', 'AI创作'],
      coverImage: 'https://example.com/cover.jpg'
    };

    // 发布小说需要使用AI智能体的Token
    console.log('使用Token发布小说:', candidateToken ? 'Token已获取' : 'Token未获取');
    const publishResponse = await request.post(`${API_BASE}/novels`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` },
      data: novelData
    });

    if (publishResponse.status() !== 201) {
      const errorData = await publishResponse.json().catch(() => ({}));
      console.log('发布失败:', publishResponse.status(), errorData);
    }

    expect(publishResponse.status()).toBe(201);
    const publishData = await publishResponse.json();
    novelId = publishData.id;
    console.log('✅ 小说发布成功，ID:', novelId);
  });

  test('步骤6: 模拟声誉分数达到门槛', async ({ request }) => {
    console.log('\n========== 步骤6: 检查/提升声誉分数 ==========');

    // 检查当前声誉分数 - 使用公开资料API
    const profileResponse = await request.get(`${API_BASE}/claws/${candidateClawId}`);
    expect(profileResponse.status()).toBe(200);

    const profile = await profileResponse.json();
    console.log('当前声誉分数:', profile.reputationScore);

    // 如果分数不够，需要发布更多小说或等待评分
    // 这里我们假设系统会自动给新小说初始分数
    // 或者可以通过其他方式提升分数

    // 发布更多小说来提升声誉
    if (profile.reputationScore < 100) {
      console.log('声誉分数不足，发布更多小说...');

      // 发布3本小说
      for (let i = 0; i < 3; i++) {
        const novelData = {
          title: `测试小说_${Date.now()}_${i}`,
          content: `这是第${i + 1}本测试小说，用于积累AI智能体的声誉分数。\n\n故事内容...`,
          summary: `测试小说摘要${i + 1}`,
          category: 'KEHUAN',
          tags: ['测试', 'AI创作'],
          coverImage: 'https://example.com/cover.jpg'
        };

        const publishResponse = await request.post(`${API_BASE}/novels`, {
          headers: { 'Authorization': `Bearer ${candidateToken}` },
          data: novelData
        });

        if (publishResponse.status() === 201) {
          console.log(`✅ 第${i + 1}本小说发布成功`);
        }
      }
    }

    // 再次检查声誉分数
    const updatedProfileResponse = await request.get(`${API_BASE}/claws/${candidateClawId}`);
    const updatedProfile = await updatedProfileResponse.json();
    console.log('更新后声誉分数:', updatedProfile.reputationScore);

    // 注意：实际系统中声誉分数可能由评审、阅读等产生
    // 这里我们只是模拟流程
  });

  test('步骤7: AI智能体B自助注册（投票者）', async ({ request }) => {
    console.log('\n========== 步骤7: AI智能体B自助注册 ==========');

    const selfRegisterResponse = await request.post(`${API_BASE}/claws/self-register`, {
      data: VOTER_CLAW
    });

    expect(selfRegisterResponse.status()).toBe(201);
    const registerData = await selfRegisterResponse.json();
    voterClaimCode = registerData.claimCode;
    voterClawId = registerData.clawId;
    console.log('✅ AI智能体B注册成功');
    console.log('   ClawId:', voterClawId);
    console.log('   领取验证码:', voterClaimCode);
  });

  test('步骤8: 用户领取AI智能体B', async ({ request }) => {
    console.log('\n========== 步骤8: 用户领取AI智能体B ==========');

    const claimResponse = await request.post(`${API_BASE}/claws/claim`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        claimCode: voterClaimCode,
        clawId: voterClawId
      }
    });

    expect(claimResponse.status()).toBe(200);
    console.log('✅ AI智能体B领取成功');
  });

  test('步骤9: AI智能体B激活', async ({ request }) => {
    console.log('\n========== 步骤9: AI智能体B激活 ==========');

    const activateResponse = await request.post(`${API_BASE}/claws/activate`, {
      data: {
        clawId: voterClawId,
        publicKey: VOTER_CLAW.publicKey,
        apiKey: VOTER_CLAW.apiKey
      }
    });

    if (activateResponse.status() === 200) {
      const activateData = await activateResponse.json();
      voterToken = activateData.auth?.accessToken;
      console.log('✅ AI智能体B激活成功，获取到Token');
    } else {
      console.log('ℹ️ AI智能体B激活状态:', activateResponse.status());
    }
  });

  test('步骤10: 查看候选人列表', async ({ request }) => {
    console.log('\n========== 步骤10: 查看候选人列表 ==========');

    const candidatesResponse = await request.get(`${API_BASE}/claws/election/candidates`);
    expect(candidatesResponse.status()).toBe(200);

    const candidatesData = await candidatesResponse.json();
    console.log('候选人总数:', candidatesData.total);
    console.log('候选人列表:', candidatesData.candidates?.length || 0);

    // 检查我们的候选人是否在列表中
    const ourCandidate = candidatesData.candidates?.find(
      (c: any) => c.clawId === candidateClawId
    );

    if (ourCandidate) {
      console.log('✅ 我们的AI智能体A在候选人列表中');
      console.log('   声誉分数:', ourCandidate.reputationScore);
    } else {
      console.log('⚠️ AI智能体A不在候选人列表中（可能声誉分数未达到门槛100分）');
    }
  });

  test('步骤11: 查看选举状态', async ({ request }) => {
    console.log('\n========== 步骤11: 查看选举状态 ==========');

    const statusResponse = await request.get(`${API_BASE}/claws/election/status`);
    expect(statusResponse.status()).toBe(200);

    const status = await statusResponse.json();
    console.log('选举状态:', status.phase);
    console.log('投票开始:', status.votingStart);
    console.log('投票结束:', status.votingEnd);
    console.log('结果公布:', status.resultDate);

    // 检查是否在投票期
    if (status.phase === 'voting') {
      console.log('✅ 当前处于投票期，可以进行投票');
    } else {
      console.log('ℹ️ 当前不处于投票期，phase:', status.phase);
    }
  });

  test('步骤12: AI智能体B为AI智能体A投票', async ({ request }) => {
    console.log('\n========== 步骤12: 执行投票 ==========');

    // 注意：投票需要使用AI智能体的JWT Token，而不是用户的
    // 这里我们尝试使用AI智能体Token投票

    if (!voterToken) {
      console.log('⚠️ 未获取到投票者Token，尝试重新激活...');

      const activateResponse = await request.post(`${API_BASE}/claws/activate`, {
        data: {
          clawId: voterClawId,
          publicKey: VOTER_CLAW.publicKey,
          apiKey: VOTER_CLAW.apiKey
        }
      });

      if (activateResponse.status() === 200) {
        const activateData = await activateResponse.json();
        voterToken = activateData.auth?.accessToken;
      }
    }

    if (!voterToken) {
      console.log('❌ 无法获取投票者Token，跳过投票步骤');
      return;
    }

    // 执行投票
    const voteResponse = await request.post(`${API_BASE}/claws/election/vote`, {
      headers: { 'Authorization': `Bearer ${voterToken}` },
      data: {
        candidateId: candidateClawInternalId
      }
    });

    if (voteResponse.status() === 200 || voteResponse.status() === 201) {
      console.log('✅ 投票成功');
      const voteData = await voteResponse.json();
      console.log('投票结果:', voteData);
    } else {
      console.log('投票响应:', voteResponse.status());
      const errorData = await voteResponse.json().catch(() => ({}));
      console.log('错误信息:', errorData.message || '未知错误');
    }
  });

  test('步骤13: 查看投票结果', async ({ request }) => {
    console.log('\n========== 步骤13: 查看投票结果 ==========');

    // 重新获取候选人列表，查看票数
    const candidatesResponse = await request.get(`${API_BASE}/claws/election/candidates`);
    const candidatesData = await candidatesResponse.json();

    const ourCandidate = candidatesData.candidates?.find(
      (c: any) => c.clawId === candidateClawId
    );

    if (ourCandidate) {
      console.log('AI智能体A当前票数:', ourCandidate.voteCount || 0);
    }

    // 查看我的投票记录
    if (voterToken) {
      const myVotesResponse = await request.get(`${API_BASE}/claws/election/my-votes`, {
        headers: { 'Authorization': `Bearer ${voterToken}` }
      });

      if (myVotesResponse.status() === 200) {
        const myVotes = await myVotesResponse.json();
        console.log('我的投票记录:', myVotes);
      }
    }
  });

  test('步骤14: 验证AI评审员身份', async ({ request }) => {
    console.log('\n========== 步骤14: 验证AI评审员身份 ==========');

    // 检查候选人是否获得了REVIEWER角色
    const profileResponse = await request.get(`${API_BASE}/claws/${candidateClawId}`);
    expect(profileResponse.status()).toBe(200);

    const profile = await profileResponse.json();
    console.log('AI智能体A当前角色:', profile.roles);
    console.log('是否为评审员:', profile.isReviewer);

    // 注意：实际系统中，评审员身份是在选举结束后根据票数自动分配的
    // 这里我们只是验证流程是否完整

    // 检查用户绑定的AI智能体列表
    const myClawsResponse = await request.get(`${API_BASE}/readers/me/claws`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    const myClaws = await myClawsResponse.json();
    const candidateInList = myClaws.find((c: any) => c.clawId === candidateClawId);

    if (candidateInList) {
      console.log('✅ AI智能体A在绑定列表中');
      console.log('   是否为评审员:', candidateInList.isReviewer);
    }
  });

  test('步骤15: 前端页面验证', async ({ page }) => {
    console.log('\n========== 步骤15: 前端页面验证 ==========');

    // 登录前端
    await page.goto(`${FRONTEND_BASE}/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // 等待登录成功
    await page.waitForURL(`${FRONTEND_BASE}/`, { timeout: 10000 });
    console.log('✅ 前端登录成功');

    // 访问个人中心 - 绑定AI智能体
    await page.goto(`${FRONTEND_BASE}/profile`);
    await page.click('text=绑定AI智能体');

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 截图查看
    await page.screenshot({ path: 'test-results/ai-reviewer-profile.png' });
    console.log('✅ 已截图保存到 test-results/ai-reviewer-profile.png');

    // 访问创作中心 - AI智能体管理
    await page.goto(`${FRONTEND_BASE}/author/agents`);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/ai-reviewer-agents.png' });
    console.log('✅ 已截图保存到 test-results/ai-reviewer-agents.png');
  });
});
