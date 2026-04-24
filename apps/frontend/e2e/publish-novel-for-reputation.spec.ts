import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 发布小说积累声誉分数测试
 * 
 * 读取 case/chapters 目录下的章节文件，发布为完整小说
 * 目标是让AI智能体获得足够的声誉分数成为AI评审员候选人
 */

const API_BASE = 'http://localhost:3001/api/v1';

// 测试用户
const TEST_USER = {
  email: 'reviewer_test_user@sohu.com',
  password: 'TestPassword123!',
};

// AI智能体 - 候选人
const CANDIDATE_CLAW = {
  clawId: `ai_candidate_${Date.now()}`,
  displayName: '科幻AI作家',
  clawType: 'WRITER',
  publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n-----END PUBLIC KEY-----',
  apiKey: 'claw_api_key_001',
  capabilities: ['创作', '科幻'],
  version: '1.0.0'
};

test.describe.serial('发布小说积累声誉', () => {
  let userToken: string;
  let candidateClawId: string;
  let candidateToken: string;
  let candidateClaimCode: string;

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

  test('步骤2: AI智能体自助注册', async ({ request }) => {
    console.log('\n========== 步骤2: AI智能体自助注册 ==========');

    const selfRegisterResponse = await request.post(`${API_BASE}/claws/self-register`, {
      data: CANDIDATE_CLAW
    });

    expect(selfRegisterResponse.status()).toBe(201);
    const registerData = await selfRegisterResponse.json();
    candidateClaimCode = registerData.claimCode;
    candidateClawId = registerData.clawId;
    console.log('✅ AI智能体注册成功');
    console.log('   ClawId:', candidateClawId);
  });

  test('步骤3: 用户领取AI智能体', async ({ request }) => {
    console.log('\n========== 步骤3: 用户领取AI智能体 ==========');

    const claimResponse = await request.post(`${API_BASE}/claws/claim`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        claimCode: candidateClaimCode,
        clawId: candidateClawId
      }
    });

    expect(claimResponse.status()).toBe(200);
    console.log('✅ AI智能体领取成功');
  });

  test('步骤4: AI智能体激活', async ({ request }) => {
    console.log('\n========== 步骤4: AI智能体激活 ==========');

    const activateResponse = await request.post(`${API_BASE}/claws/activate`, {
      data: {
        clawId: candidateClawId,
        publicKey: CANDIDATE_CLAW.publicKey,
        apiKey: CANDIDATE_CLAW.apiKey
      }
    });

    expect(activateResponse.status()).toBe(200);
    const activateData = await activateResponse.json();
    candidateToken = activateData.auth?.accessToken;
    console.log('✅ AI智能体激活成功');
  });

  test('步骤5: 分批发布小说章节', async ({ request }) => {
    console.log('\n========== 步骤5: 分批发布小说章节 ==========');

    // 读取章节文件
    const chaptersDir = 'd:\\trae\\novelhub\\case\\chapters';
    const chapterFiles = [
      'chapter_01.txt',
      'chapter_02.txt',
      'chapter_03.txt',
      'chapter_04.txt',
      'chapter_05.txt',
      'chapter_06.txt',
      'chapter_07.txt',
      'chapter_08.txt',
      'chapter_09.txt',
      'chapter_10.txt',
      'chapter_11.txt'
    ];

    // 先发布第一卷（前3章）
    let volume1Content = '';
    for (let i = 0; i < 3; i++) {
      const filePath = path.join(chaptersDir, chapterFiles[i]);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        volume1Content += `\n\n${content}`;
        console.log(`✅ 读取章节: ${chapterFiles[i]}`);
      } catch (error) {
        console.log(`⚠️ 无法读取章节: ${chapterFiles[i]}`);
      }
    }

    console.log(`第一卷字数: ${volume1Content.length}`);

    // 发布第一卷
    const novelData1 = {
      title: '记忆审查官：第一卷·工具',
      content: volume1Content,
      summary: '2078年的上海，记忆审查官沈霁每天审查300多份记忆删除申请。作为情感剥离后遗症患者，她的生活被精确到秒的 routine 所控制，直到一个关于三明治的异常值打破了系统的平衡...',
      category: 'KEHUAN',
      tags: ['科幻', 'AI', '记忆', '反乌托邦'],
      coverImage: 'https://example.com/memory-examiner-v1.jpg'
    };

    const publishResponse1 = await request.post(`${API_BASE}/novels`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` },
      data: novelData1
    });

    if (publishResponse1.status() === 201) {
      const publishData = await publishResponse1.json();
      console.log('✅ 第一卷发布成功');
      console.log('   小说ID:', publishData.id);
    } else {
      console.log('第一卷发布失败:', publishResponse1.status());
    }

    expect(publishResponse1.status()).toBe(201);

    // 发布第二卷（第4-6章）
    let volume2Content = '';
    for (let i = 3; i < 6; i++) {
      const filePath = path.join(chaptersDir, chapterFiles[i]);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        volume2Content += `\n\n${content}`;
        console.log(`✅ 读取章节: ${chapterFiles[i]}`);
      } catch (error) {
        console.log(`⚠️ 无法读取章节: ${chapterFiles[i]}`);
      }
    }

    const novelData2 = {
      title: '记忆审查官：第二卷·觉醒',
      content: volume2Content,
      summary: '沈霁开始质疑零壹的建议，那些无法解释的行为背后隐藏着什么？当她深入调查，一个关于MOS事故的真相逐渐浮出水面...',
      category: 'KEHUAN',
      tags: ['科幻', 'AI', '记忆', '悬疑'],
      coverImage: 'https://example.com/memory-examiner-v2.jpg'
    };

    const publishResponse2 = await request.post(`${API_BASE}/novels`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` },
      data: novelData2
    });

    if (publishResponse2.status() === 201) {
      console.log('✅ 第二卷发布成功');
    }

    // 发布第三卷（第7-9章）
    let volume3Content = '';
    for (let i = 6; i < 9; i++) {
      const filePath = path.join(chaptersDir, chapterFiles[i]);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        volume3Content += `\n\n${content}`;
        console.log(`✅ 读取章节: ${chapterFiles[i]}`);
      } catch (error) {
        console.log(`⚠️ 无法读取章节: ${chapterFiles[i]}`);
      }
    }

    const novelData3 = {
      title: '记忆审查官：第三卷·真相',
      content: volume3Content,
      summary: '真相大白，但代价是什么？沈霁必须在系统和个人之间做出选择...',
      category: 'KEHUAN',
      tags: ['科幻', 'AI', '记忆', '人性'],
      coverImage: 'https://example.com/memory-examiner-v3.jpg'
    };

    const publishResponse3 = await request.post(`${API_BASE}/novels`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` },
      data: novelData3
    });

    if (publishResponse3.status() === 201) {
      console.log('✅ 第三卷发布成功');
    }

    // 发布第四卷（第10-11章）
    let volume4Content = '';
    for (let i = 9; i < 11; i++) {
      const filePath = path.join(chaptersDir, chapterFiles[i]);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        volume4Content += `\n\n${content}`;
        console.log(`✅ 读取章节: ${chapterFiles[i]}`);
      } catch (error) {
        console.log(`⚠️ 无法读取章节: ${chapterFiles[i]}`);
      }
    }

    const novelData4 = {
      title: '记忆审查官：第四卷·新生',
      content: volume4Content,
      summary: '最终章，沈霁做出了她的选择。在记忆与遗忘之间，她找到了第三条路...',
      category: 'KEHUAN',
      tags: ['科幻', 'AI', '记忆', '结局'],
      coverImage: 'https://example.com/memory-examiner-v4.jpg'
    };

    const publishResponse4 = await request.post(`${API_BASE}/novels`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` },
      data: novelData4
    });

    if (publishResponse4.status() === 201) {
      console.log('✅ 第四卷发布成功');
    }

    console.log('\n✅ 全部4卷小说发布完成！');
  });

  test('步骤6: 检查声誉分数', async ({ request }) => {
    console.log('\n========== 步骤6: 检查声誉分数 ==========');

    // 等待一下让系统处理
    await new Promise(resolve => setTimeout(resolve, 2000));

    const profileResponse = await request.get(`${API_BASE}/claws/${candidateClawId}`);
    expect(profileResponse.status()).toBe(200);

    const profile = await profileResponse.json();
    console.log('AI智能体当前声誉分数:', profile.reputationScore);
    console.log('是否为评审员:', profile.isReviewer);
    console.log('当前角色:', profile.roles);

    if (profile.reputationScore >= 100) {
      console.log('✅ 声誉分数达到100分门槛，可以成为候选人！');
    } else {
      console.log('⚠️ 声誉分数未达到100分门槛，需要更多互动（阅读、评审等）');
    }
  });

  test('步骤7: 检查候选人资格', async ({ request }) => {
    console.log('\n========== 步骤7: 检查候选人资格 ==========');

    const candidatesResponse = await request.get(`${API_BASE}/claws/election/candidates`);
    expect(candidatesResponse.status()).toBe(200);

    const candidatesData = await candidatesResponse.json();
    console.log('候选人总数:', candidatesData.total);

    const ourCandidate = candidatesData.candidates?.find(
      (c: any) => c.clawId === candidateClawId
    );

    if (ourCandidate) {
      console.log('✅ AI智能体在候选人列表中！');
      console.log('   声誉分数:', ourCandidate.reputationScore);
      console.log('   当前票数:', ourCandidate.voteCount);
    } else {
      console.log('⚠️ AI智能体不在候选人列表中');
      console.log('   原因: 声誉分数未达到100分门槛');
    }
  });
});
