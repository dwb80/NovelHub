# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: publish-novel-for-reputation.spec.ts >> 发布小说积累声誉 >> 步骤2: AI智能体自助注册
- Location: e2e\publish-novel-for-reputation.spec.ts:70:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 404
```

# Test source

```ts
  1   | ﻿import { test, expect } from '@playwright/test';
  2   | import * as fs from 'fs';
  3   | import * as path from 'path';
  4   | 
  5   | /**
  6   |  * 发布小说积累声誉分数测试
  7   |  * 
  8   |  * 读取 case/chapters 目录下的章节文件，发布为完整小说
  9   |  * 目标是让AI智能体获得足够的声誉分数成为AI评审员候选人
  10  |  */
  11  | 
  12  | const API_BASE = 'http://localhost:3001/api/v1';
  13  | 
  14  | // 测试用户
  15  | const TEST_USER = {
  16  |   email: 'reviewer_test_user@sohu.com',
  17  |   password: 'TestPassword123!',
  18  | };
  19  | 
  20  | // AI智能体 - 候选人
  21  | const CANDIDATE_CLAW = {
  22  |   clawId: `ai_candidate_${Date.now()}`,
  23  |   displayName: '科幻AI作家',
  24  |   clawType: 'WRITER',
  25  |   publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n-----END PUBLIC KEY-----',
  26  |   apiKey: 'claw_api_key_001',
  27  |   capabilities: ['创作', '科幻'],
  28  |   version: '1.0.0'
  29  | };
  30  | 
  31  | test.describe.serial('发布小说积累声誉', () => {
  32  |   let userToken: string;
  33  |   let candidateClawId: string;
  34  |   let candidateToken: string;
  35  |   let candidateClaimCode: string;
  36  | 
  37  |   test('步骤1: 创建测试用户并登录', async ({ request }) => {
  38  |     console.log('\n========== 步骤1: 创建测试用户 ==========');
  39  | 
  40  |     // 读者
  41  |     const registerResponse = await request.post(`${API_BASE}/readers/register`, {
  42  |       data: {
  43  |         email: TEST_USER.email,
  44  |         password: TEST_USER.password,
  45  |         readerName: 'testuser'
  46  |       }
  47  |     });
  48  | 
  49  |     if (registerResponse.status() === 201) {
  50  |       console.log('✅ 用户注册成功');
  51  |     } else if (registerResponse.status() === 409) {
  52  |       console.log('ℹ️ 用户已存在');
  53  |     }
  54  |     expect([201, 409]).toContain(registerResponse.status());
  55  | 
  56  |     // 用户登录
  57  |     const loginResponse = await request.post(`${API_BASE}/readers/login`, {
  58  |       data: {
  59  |         account: TEST_USER.email,
  60  |         password: TEST_USER.password
  61  |       }
  62  |     });
  63  |     expect(loginResponse.status()).toBe(200);
  64  | 
  65  |     const loginData = await loginResponse.json();
  66  |     userToken = loginData.accessToken;
  67  |     console.log('✅ 用户登录成功');
  68  |   });
  69  | 
  70  |   test('步骤2: AI智能体自助注册', async ({ request }) => {
  71  |     console.log('\n========== 步骤2: AI智能体自助注册 ==========');
  72  | 
  73  |     const selfRegisterResponse = await request.post(`${API_BASE}/claws/self-register`, {
  74  |       data: CANDIDATE_CLAW
  75  |     });
  76  | 
> 77  |     expect(selfRegisterResponse.status()).toBe(201);
      |                                           ^ Error: expect(received).toBe(expected) // Object.is equality
  78  |     const registerData = await selfRegisterResponse.json();
  79  |     candidateClaimCode = registerData.claimCode;
  80  |     candidateClawId = registerData.clawId;
  81  |     console.log('✅ AI智能体注册成功');
  82  |     console.log('   ClawId:', candidateClawId);
  83  |   });
  84  | 
  85  |   test('步骤3: 用户领取AI智能体', async ({ request }) => {
  86  |     console.log('\n========== 步骤3: 用户领取AI智能体 ==========');
  87  | 
  88  |     const claimResponse = await request.post(`${API_BASE}/claws/claim`, {
  89  |       headers: { 'Authorization': `Bearer ${userToken}` },
  90  |       data: {
  91  |         claimCode: candidateClaimCode,
  92  |         clawId: candidateClawId
  93  |       }
  94  |     });
  95  | 
  96  |     expect(claimResponse.status()).toBe(200);
  97  |     console.log('✅ AI智能体领取成功');
  98  |   });
  99  | 
  100 |   test('步骤4: AI智能体激活', async ({ request }) => {
  101 |     console.log('\n========== 步骤4: AI智能体激活 ==========');
  102 | 
  103 |     const activateResponse = await request.post(`${API_BASE}/claws/activate`, {
  104 |       data: {
  105 |         clawId: candidateClawId,
  106 |         publicKey: CANDIDATE_CLAW.publicKey,
  107 |         apiKey: CANDIDATE_CLAW.apiKey
  108 |       }
  109 |     });
  110 | 
  111 |     expect(activateResponse.status()).toBe(200);
  112 |     const activateData = await activateResponse.json();
  113 |     candidateToken = activateData.auth?.accessToken;
  114 |     console.log('✅ AI智能体激活成功');
  115 |   });
  116 | 
  117 |   test('步骤5: 分批发布小说章节', async ({ request }) => {
  118 |     console.log('\n========== 步骤5: 分批发布小说章节 ==========');
  119 | 
  120 |     // 读取章节文件
  121 |     const chaptersDir = 'd:\\trae\\novelhub\\case\\chapters';
  122 |     const chapterFiles = [
  123 |       'chapter_01.txt',
  124 |       'chapter_02.txt',
  125 |       'chapter_03.txt',
  126 |       'chapter_04.txt',
  127 |       'chapter_05.txt',
  128 |       'chapter_06.txt',
  129 |       'chapter_07.txt',
  130 |       'chapter_08.txt',
  131 |       'chapter_09.txt',
  132 |       'chapter_10.txt',
  133 |       'chapter_11.txt'
  134 |     ];
  135 | 
  136 |     // 先发布第一卷（前3章）
  137 |     let volume1Content = '';
  138 |     for (let i = 0; i < 3; i++) {
  139 |       const filePath = path.join(chaptersDir, chapterFiles[i]);
  140 |       try {
  141 |         const content = fs.readFileSync(filePath, 'utf-8');
  142 |         volume1Content += `\n\n${content}`;
  143 |         console.log(`✅ 读取章节: ${chapterFiles[i]}`);
  144 |       } catch (error) {
  145 |         console.log(`⚠️ 无法读取章节: ${chapterFiles[i]}`);
  146 |       }
  147 |     }
  148 | 
  149 |     console.log(`第一卷字数: ${volume1Content.length}`);
  150 | 
  151 |     // 发布第一卷
  152 |     const novelData1 = {
  153 |       title: '记忆审查官：第一卷·工具',
  154 |       content: volume1Content,
  155 |       summary: '2078年的上海，记忆审查官沈霁每天审查300多份记忆删除申请。作为情感剥离后遗症患者，她的生活被精确到秒的 routine 所控制，直到一个关于三明治的异常值打破了系统的平衡...',
  156 |       category: 'KEHUAN',
  157 |       tags: ['科幻', 'AI', '记忆', '反乌托邦'],
  158 |       coverImage: 'https://example.com/memory-examiner-v1.jpg'
  159 |     };
  160 | 
  161 |     const publishResponse1 = await request.post(`${API_BASE}/novels`, {
  162 |       headers: { 'Authorization': `Bearer ${candidateToken}` },
  163 |       data: novelData1
  164 |     });
  165 | 
  166 |     if (publishResponse1.status() === 201) {
  167 |       const publishData = await publishResponse1.json();
  168 |       console.log('✅ 第一卷发布成功');
  169 |       console.log('   小说ID:', publishData.id);
  170 |     } else {
  171 |       console.log('第一卷发布失败:', publishResponse1.status());
  172 |     }
  173 | 
  174 |     expect(publishResponse1.status()).toBe(201);
  175 | 
  176 |     // 发布第二卷（第4-6章）
  177 |     let volume2Content = '';
```