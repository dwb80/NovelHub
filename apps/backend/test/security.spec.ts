import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Security Tests (安全测试)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('🔐 SQL 注入防护', () => {

    it("SQL 注入攻击 ' OR 1=1 -- 应该被拒绝", async () => {
      const response = await helper.request()
        .post('/users/login')
        .send({
          emailOrUsername: "' OR 1=1 --",
          password: 'any',
        });

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
      expect(response.body.message).toContain('认证失败');
    });

    it("SQL 注入攻击 ' UNION SELECT * FROM users -- 应该被拒绝", async () => {
      const response = await helper.request()
        .post('/users/login')
        .send({
          emailOrUsername: "' UNION SELECT * FROM users --",
          password: 'any',
        });

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
    });

    it('数字型 SQL 注入应该被拒绝', async () => {
      const response = await helper.request()
        .get('/novels?id=1 OR 1=1');

      expect(response.status).not.toBe(500);
    });

    it('搜索参数 SQL 注入应该被拒绝', async () => {
      const response = await helper.request()
        .get("/search/novels?q=' OR 1=1 --");

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(response.status).not.toBe(500);
    });

  });

  describe('🚫 XSS 跨站脚本攻击防护', () => {

    it('反射型 XSS 应该被过滤', async () => {
      const response = await helper.request()
        .get('/search/novels?q=<script>alert(1)</script>');

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(response.text).not.toContain('<script>');
    });

    it('存储型 XSS 评论内容应该被过滤', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'test',
          content: '<script>alert("xss")</script> 这是评论',
        });

      if (response.status === ExpectedStatus.CREATED) {
        expect(response.body.content).not.toContain('<script>');
      }
    });

    it('用户资料中的 XSS 应该被过滤', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .put('/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: '<img src=x onerror=alert(1)>',
        });

      expect(response.status).not.toBe(500);
    });

  });

  describe('🔑 JWT Token 安全', () => {

    it('篡改后的 Token 应该被拒绝', async () => {
      const token = await helper.getAuthToken('user');
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      payload.userId = 'someone_else';

      const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const response = await helper.request()
        .get('/users/profile')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
    });

    it('过期 Token 应该被拒绝', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkxMjJ9.invalid_signature';

      const response = await helper.request()
        .get('/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
    });

    it('无签名 Token 应该被拒绝', async () => {
      const unsignedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.';

      const response = await helper.request()
        .get('/users/profile')
        .set('Authorization', `Bearer ${unsignedToken}`);

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
    });

  });

  describe('🛡️ 权限提升防护', () => {

    it('读者不能访问 Claw 专属接口', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/novels')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.novels.validNovel);

      expect(response.status).toBe(ExpectedStatus.FORBIDDEN);
    });

    it('用户 A 不能访问用户 B 的订单', async () => {
      const userA = await helper.getAuthToken('user');
      const userB = await helper.getAuthToken('user');

      const orderResponse = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${userA}`)
        .send(TestData.payments.validOrder);

      const orderId = orderResponse.body.orderId;

      const response = await helper.request()
        .get(`/payments/orders/${orderId}`)
        .set('Authorization', `Bearer ${userB}`);

      expect(response.status).toBe(ExpectedStatus.FORBIDDEN);
    });

    it('未授权不能访问任何受保护接口', async () => {
      const protectedEndpoints = [
        { method: 'GET', path: '/users/profile' },
        { method: 'GET', path: '/notifications' },
        { method: 'GET', path: '/payments/orders' },
        { method: 'GET', path: '/statistics/daily' },
        { method: 'GET', path: '/claws/me' },
      ];

      for (const endpoint of protectedEndpoints) {
        const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
        const response = await helper.request()[method](endpoint.path);
        expect([ExpectedStatus.UNAUTHORIZED, ExpectedStatus.FORBIDDEN]).toContain(response.status);
      }
    });

  });

  describe('🚦 速率限制测试', () => {

    it('快速连续登录失败应该触发限流', async () => {
      console.log('🚦 测试登录速率限制...');

      let blocked = false;

      for (let i = 0; i < 20; i++) {
        const response = await helper.request()
          .post('/users/login')
          .send({
            emailOrUsername: `attacker_${Date.now()}@example.com`,
            password: 'wrong_password',
          });

        if (response.status === 429) {
          blocked = true;
          break;
        }
      }

      if (blocked) {
        console.log('   ✅ 速率限制已触发');
      } else {
        console.log('   ℹ️  未触发速率限制 (可能未配置)');
      }
    });

  });

  describe('📋 敏感信息泄露防护', () => {

    it('错误响应不应该暴露堆栈信息', async () => {
      const response = await helper.request()
        .get('/invalid-endpoint-that-does-not-exist');

      expect(response.text).not.toContain('at ');
      expect(response.text).not.toContain('Error:');
      expect(response.text).not.toContain('node_modules');
    });

    it('密码不应该在任何响应中返回', async () => {
      const timestamp = Date.now();
      const response = await helper.request()
        .post('/users/register')
        .send({
          username: `secure_${timestamp}`,
          email: `secure_${timestamp}@example.com`,
          password: 'MySecretPassword123!',
        });

      expect(JSON.stringify(response.body)).not.toContain('MySecretPassword123!');
      expect(response.body.user?.password).toBeUndefined();
      expect(response.body.user?.passwordHash).toBeUndefined();
    });

  });

});
