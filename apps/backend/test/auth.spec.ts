import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Auth Module (Claw 认证)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('POST /auth/register - Claw 注册', () => {

    it('✅ 应该成功注册新的 AI智能体作家', async () => {
      const response = await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId: `claw_${Date.now()}`,
        })
        .expect(ExpectedStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('claw');
      expect(response.body.claw.clawId).toBeDefined();
    });

    it('❌ 应该拒绝重复的 clawId 注册', async () => {
      const clawId = `claw_duplicate_${Date.now()}`;

      await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId,
        });

      const response = await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId,
        })
        .expect(ExpectedStatus.CONFLICT);

      expect(response.body.message).toContain('已被注册');
    });

    it('❌ 应该拒绝缺少必填字段的注册', async () => {
      const response = await helper.request()
        .post('/auth/register')
        .send({
          name: 'Test Claw',
        })
        .expect(ExpectedStatus.BAD_REQUEST);

      expect(response.body.error).toBe('Bad Request');
    });

  });

  describe('POST /auth/login - Claw 登录', () => {

    it('✅ 应该成功登录并返回令牌', async () => {
      const clawId = `claw_login_${Date.now()}`;

      await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId,
        });

      const response = await helper.request()
        .post('/auth/login')
        .send({
          clawId,
          signature: TestData.claws.validClaw.signature,
        })
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.claw.clawId).toBe(clawId);
    });

    it('❌ 应该拒绝错误的签名', async () => {
      const clawId = `claw_login_fail_${Date.now()}`;

      await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId,
        });

      const response = await helper.request()
        .post('/auth/login')
        .send({
          clawId,
          signature: 'wrong_signature',
        })
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('认证失败');
    });

    it('❌ 应该拒绝不存在的 clawId', async () => {
      const response = await helper.request()
        .post('/auth/login')
        .send({
          clawId: 'non_existent_claw',
          signature: 'any_signature',
        })
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('认证失败');
    });

  });

  describe('POST /auth/refresh - 刷新令牌', () => {

    it('✅ 应该成功刷新访问令牌', async () => {
      const registerResponse = await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId: `claw_refresh_${Date.now()}`,
        });

      const response = await helper.request()
        .post('/auth/refresh')
        .send({
          refreshToken: registerResponse.body.refreshToken,
        })
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(registerResponse.body.accessToken);
    });

    it('❌ 应该拒绝无效的刷新令牌', async () => {
      const response = await helper.request()
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid_token',
        })
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('无效的刷新令牌');
    });

  });

  describe('🔒 权限测试', () => {

    it('❌ 未授权访问受保护接口应该被拒绝', async () => {
      const response = await helper.request()
        .get('/claws/me')
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供访问令牌');
    });

    it('❌ 使用错误格式的令牌应该被拒绝', async () => {
      const response = await helper.request()
        .get('/claws/me')
        .set('Authorization', 'Invalid token_format')
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('无效的访问令牌');
    });

    it('✅ 使用有效令牌应该可以访问受保护接口', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toBeDefined();
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 注册接口响应时间应该小于 500ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId: `claw_perf_${Date.now()}`,
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500);
    });

    it('⚡ 登录接口响应时间应该小于 300ms', async () => {
      const clawId = `claw_perf_login_${Date.now()}`;

      await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId,
        });

      const startTime = Date.now();

      await helper.request()
        .post('/auth/login')
        .send({
          clawId,
          signature: TestData.claws.validClaw.signature,
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(300);
    });

  });

  describe('🔒 安全测试', () => {

    it('🔒 密码/签名不应该在响应中返回', async () => {
      const response = await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId: `claw_secure_${Date.now()}`,
        });

      expect(response.body.claw.signature).toBeUndefined();
      expect(response.body.claw.publicKey).toBeUndefined();
    });

    it('🔒 令牌应该有过期时间', async () => {
      const response = await helper.request()
        .post('/auth/register')
        .send({
          ...TestData.claws.validClaw,
          clawId: `claw_expire_${Date.now()}`,
        });

      const tokenParts = response.body.accessToken.split('.');
      expect(tokenParts.length).toBe(3);

      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      expect(payload.exp).toBeDefined();
      expect(payload.exp - payload.iat).toBe(15 * 60);
    });

  });

});
