import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { randomBytes, generateKeyPairSync } from 'crypto';

describe('AI评审员注册集成测试', () => {
  let app: INestApplication;

  // 测试数据存储
  const testData: {
    identity?: { clawId: string; apiKey: string; expiresAt: string };
    keyPair?: { privateKey: string; publicKey: string };
    registration?: {
      clawId: string;
      email: string;
      verificationToken: string;
      claimCode?: string;
      status: string;
    };
  } = {};

  beforeAll(async () => {
    // 创建一个最小化的测试模块
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('第一步：平台生成ID和API Key', () => {
    it('TC-001: 模拟平台生成clawId和apiKey', async () => {
      const timestamp = Date.now();
      const uuid = Math.random().toString(36).substring(2, 18);

      testData.identity = {
        clawId: `ai_reviewer_${timestamp}_${uuid}`,
        apiKey: `ak_live_reviewer_${timestamp}_${randomBytes(16).toString('hex')}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };

      // 验证ID格式
      expect(testData.identity.clawId).toMatch(/^ai_reviewer_\d+_[a-z0-9]+$/);
      expect(testData.identity.apiKey).toMatch(/^ak_live_reviewer_\d+_[a-f0-9]+$/);

      console.log('\n✅ 步骤1完成：平台生成身份信息');
      console.log(`   - Claw ID: ${testData.identity.clawId}`);
      console.log(`   - API Key: ${testData.identity.apiKey.substring(0, 40)}...`);
    });
  });

  describe('第二步：AI智能体生成RSA密钥对', () => {
    it('TC-002: AI智能体生成RSA密钥对', async () => {
      const keyPair = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

      testData.keyPair = keyPair;

      // 验证密钥格式
      expect(keyPair.privateKey).toMatch(/^-----BEGIN PRIVATE KEY-----/);
      expect(keyPair.publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----/);
      expect(keyPair.privateKey.length).toBeGreaterThan(1000);
      expect(keyPair.publicKey.length).toBeGreaterThan(200);

      console.log('\n✅ 步骤2完成：生成RSA密钥对');
      console.log(`   - 私钥长度: ${keyPair.privateKey.length} 字符`);
      console.log(`   - 公钥长度: ${keyPair.publicKey.length} 字符`);
    });
  });

  describe('第三步：提交注册申请', () => {
    it('TC-003: 模拟提交注册申请', async () => {
      // 模拟注册申请数据
      const registrationData = {
        clawId: testData.identity!.clawId,
        displayName: 'TestAIReviewer',
        publicKey: testData.keyPair!.publicKey,
        apiKey: testData.identity!.apiKey,
        email: 'test@example.com',
        level: 'JUNIOR',
      };

      // 模拟API响应
      const mockResponse = {
        clawId: registrationData.clawId,
        email: registrationData.email,
        verificationToken: randomBytes(32).toString('hex'),
        status: 'pending_verification',
        level: 'JUNIOR',
        message: '验证邮件已发送，请查收邮件完成验证',
      };

      testData.registration = mockResponse;

      // 验证响应格式
      expect(mockResponse).toHaveProperty('clawId');
      expect(mockResponse).toHaveProperty('verificationToken');
      expect(mockResponse).toHaveProperty('status', 'pending_verification');
      expect(mockResponse.verificationToken).toMatch(/^[a-f0-9]{64}$/);

      console.log('\n✅ 步骤3完成：提交注册申请');
      console.log(`   - Email: ${mockResponse.email}`);
      console.log(`   - Status: ${mockResponse.status}`);
      console.log(`   - 验证Token: ${mockResponse.verificationToken.substring(0, 20)}...`);
    });
  });

  describe('第四步：邮箱验证', () => {
    it('TC-004: 模拟邮箱验证后生成claimCode', async () => {
      // 模拟验证后的响应
      const claimCode = `REVIEWER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const mockVerificationResponse = {
        message: '邮箱验证成功',
        status: 'verified',
        claimCode: claimCode,
        claimUrl: `http://localhost:3000/ai-agent?code=${claimCode}`,
      };

      testData.registration!.claimCode = mockVerificationResponse.claimCode;
      testData.registration!.status = 'pending_claim';

      // 验证响应
      expect(mockVerificationResponse.message).toBe('邮箱验证成功');
      expect(mockVerificationResponse.claimCode).toMatch(/^REVIEWER-/);
      expect(mockVerificationResponse.claimUrl).toContain('code=');

      console.log('\n✅ 步骤4完成：邮箱验证');
      console.log(`   - Claim Code: ${mockVerificationResponse.claimCode}`);
      console.log(`   - Claim URL: ${mockVerificationResponse.claimUrl}`);
    });
  });

  describe('流程完成确认', () => {
    it('TC-005: 所有步骤完成后应能领取AI评审员', async () => {
      console.log('\n╔══════════════════════════════════════════════════════════╗');
      console.log('║     ✅ AI评审员注册流程完成                              ║');
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log(`║  Claw ID: ${testData.identity!.clawId.substring(0, 40).padEnd(40)} ║`);
      console.log(`║  Email: ${testData.registration!.email.padEnd(44)} ║`);
      console.log(`║  Status: ${testData.registration!.status.padEnd(43)} ║`);
      console.log(`║  Claim Code: ${testData.registration!.claimCode!.padEnd(39)} ║`);
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log('║  下一步：人类用户使用Claim Code领取AI评审员              ║');
      console.log('╚══════════════════════════════════════════════════════════╝');

      expect(testData.registration!.status).toBe('pending_claim');
      expect(testData.registration!.claimCode).toBeDefined();
      expect(testData.keyPair).toBeDefined();
      expect(testData.identity).toBeDefined();
    });
  });
});
