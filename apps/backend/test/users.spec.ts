import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Users Module (用户模块)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('POST /users/register - 用户注册', () => {

    it('✅ 应该成功注册新用户', async () => {
      const timestamp = Date.now();
      const response = await helper.request()
        .post('/users/register')
        .send({
          username: `user_${timestamp}`,
          email: `user_${timestamp}@example.com`,
          password: 'TestPass123!',
        })
        .expect(ExpectedStatus.CREATED);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(`user_${timestamp}@example.com`);
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('❌ 应该拒绝重复邮箱注册', async () => {
      const timestamp = Date.now();
      const email = `duplicate_${timestamp}@example.com`;

      await helper.request()
        .post('/users/register')
        .send({
          username: `user1_${timestamp}`,
          email,
          password: 'TestPass123!',
        });

      const response = await helper.request()
        .post('/users/register')
        .send({
          username: `user2_${timestamp}`,
          email,
          password: 'TestPass123!',
        })
        .expect(ExpectedStatus.CONFLICT);

      expect(response.body.message).toContain('邮箱已被注册');
    });

    it('❌ 应该拒绝重复用户名注册', async () => {
      const timestamp = Date.now();
      const username = `sameuser_${timestamp}`;

      await helper.request()
        .post('/users/register')
        .send({
          username,
          email: `user1_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const response = await helper.request()
        .post('/users/register')
        .send({
          username,
          email: `user2_${timestamp}@example.com`,
          password: 'TestPass123!',
        })
        .expect(ExpectedStatus.CONFLICT);

      expect(response.body.message).toContain('用户名已被使用');
    });

    it('❌ 应该拒绝邮箱格式错误', async () => {
      const response = await helper.request()
        .post('/users/register')
        .send(TestData.users.invalidEmail)
        .expect(ExpectedStatus.BAD_REQUEST);

      expect(response.body.error).toBe('Bad Request');
    });

    it('❌ 应该拒绝过短的密码', async () => {
      const response = await helper.request()
        .post('/users/register')
        .send(TestData.users.shortPassword)
        .expect(ExpectedStatus.BAD_REQUEST);

      expect(response.body.error).toBe('Bad Request');
    });

    it('❌ 应该拒绝缺少必填字段', async () => {
      const response = await helper.request()
        .post('/users/register')
        .send({
          email: 'test@example.com',
        })
        .expect(ExpectedStatus.BAD_REQUEST);

      expect(response.body.error).toBe('Bad Request');
    });

  });

  describe('POST /users/login - 用户登录', () => {

    it('✅ 应该使用邮箱成功登录', async () => {
      const timestamp = Date.now();
      const email = `login_${timestamp}@example.com`;
      const password = 'TestPass123!';

      await helper.request()
        .post('/users/register')
        .send({
          username: `loginuser_${timestamp}`,
          email,
          password,
        });

      const response = await helper.request()
        .post('/users/login')
        .send({
          emailOrUsername: email,
          password,
        })
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('✅ 应该使用用户名成功登录', async () => {
      const timestamp = Date.now();
      const username = `loginname_${timestamp}`;
      const password = 'TestPass123!';

      await helper.request()
        .post('/users/register')
        .send({
          username,
          email: `${username}@example.com`,
          password,
        });

      const response = await helper.request()
        .post('/users/login')
        .send({
          emailOrUsername: username,
          password,
        })
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('❌ 应该拒绝错误密码', async () => {
      const timestamp = Date.now();

      await helper.request()
        .post('/users/register')
        .send({
          username: `wrongpass_${timestamp}`,
          email: `wrongpass_${timestamp}@example.com`,
          password: 'CorrectPass123!',
        });

      const response = await helper.request()
        .post('/users/login')
        .send({
          emailOrUsername: `wrongpass_${timestamp}@example.com`,
          password: 'WrongPassword!',
        })
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('密码错误');
    });

    it('❌ 应该拒绝不存在的用户', async () => {
      const response = await helper.request()
        .post('/users/login')
        .send({
          emailOrUsername: 'nonexistent@example.com',
          password: 'AnyPass123!',
        })
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('认证失败');
    });

  });

  describe('GET /users/profile - 获取用户信息', () => {

    it('✅ 应该成功获取用户信息', async () => {
      const timestamp = Date.now();
      const registerResponse = await helper.request()
        .post('/users/register')
        .send({
          username: `profile_${timestamp}`,
          email: `profile_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const response = await helper.request()
        .get('/users/profile')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.username).toBe(`profile_${timestamp}`);
      expect(response.body.email).toBe(`profile_${timestamp}@example.com`);
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('❌ 未授权访问应该被拒绝', async () => {
      const response = await helper.request()
        .get('/users/profile')
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供访问令牌');
    });

  });

  describe('PUT /users/profile - 更新用户信息', () => {

    it('✅ 应该成功更新用户名', async () => {
      const timestamp = Date.now();
      const registerResponse = await helper.request()
        .post('/users/register')
        .send({
          username: `oldname_${timestamp}`,
          email: `update_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const response = await helper.request()
        .put('/users/profile')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
        .send({
          username: `newname_${timestamp}`,
        })
        .expect(ExpectedStatus.OK);

      expect(response.body.username).toBe(`newname_${timestamp}`);
    });

    it('❌ 更新用户名时应该检测重复', async () => {
      const timestamp = Date.now();
      const existingUser = `existing_${timestamp}`;

      await helper.request()
        .post('/users/register')
        .send({
          username: existingUser,
          email: `existing_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const registerResponse = await helper.request()
        .post('/users/register')
        .send({
          username: `tester_${timestamp}`,
          email: `tester_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const response = await helper.request()
        .put('/users/profile')
        .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
        .send({
          username: existingUser,
        })
        .expect(ExpectedStatus.CONFLICT);

      expect(response.body.message).toContain('用户名已被使用');
    });

  });

  describe('🔒 安全测试', () => {

    it('🔒 密码不应该明文存储和返回', async () => {
      const timestamp = Date.now();
      const response = await helper.request()
        .post('/users/register')
        .send({
          username: `secure_${timestamp}`,
          email: `secure_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('🔒 SQL 注入防护测试', async () => {
      const response = await helper.request()
        .post('/users/login')
        .send({
          emailOrUsername: "' OR 1=1 --",
          password: 'any',
        })
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('认证失败');
    });

  });

});
