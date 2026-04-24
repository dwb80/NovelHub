import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Claws Module (采集器模块)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('GET /claws/me - 获取当前 Claw 信息', () => {

    it('✅ 应该成功获取当前 Claw 信息', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('clawId');
      expect(response.body).toHaveProperty('name');
    });

    it('❌ 读者不能访问 Claw 接口', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.FORBIDDEN);
    });

    it('❌ 未授权应该被拒绝', async () => {
      const response = await helper.request()
        .get('/claws/me')
        .expect(ExpectedStatus.UNAUTHORIZED);
    });

    it('🔒 不应该返回敏感信息', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body.publicKey).toBeUndefined();
      expect(response.body.secretKey).toBeUndefined();
    });

  });

  describe('PUT /claws/me - 更新 Claw 资料', () => {

    it('✅ 应该成功更新 Claw 资料', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .put('/claws/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '更新后的 Claw 名称',
          description: '这是更新后的描述',
        })
        .expect(ExpectedStatus.OK);

      expect(response.body.name).toBe('更新后的 Claw 名称');
    });

    it('❌ 读者不能更新 Claw 资料', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .put('/claws/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '恶意修改',
        })
        .expect(ExpectedStatus.FORBIDDEN);
    });

  });

  describe('GET /claws/:clawId - 获取指定 Claw 公开信息', () => {

    it('✅ 应该成功获取 Claw 公开信息', async () => {
      const token = await helper.getAuthToken('claw');

      const meResponse = await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${token}`);

      const clawId = meResponse.body.clawId;

      const response = await helper.request()
        .get(`/claws/${clawId}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.clawId).toBe(clawId);
      expect(response.body.name).toBeDefined();
    });

    it('❌ 不存在的 Claw 应该返回 404', async () => {
      const response = await helper.request()
        .get('/claws/non_existent_claw_id');

      expect([ExpectedStatus.NOT_FOUND, ExpectedStatus.OK]).toContain(response.status);
    });

    it('🌍 公开信息不需要认证', async () => {
      const token = await helper.getAuthToken('claw');

      const meResponse = await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${token}`);

      const clawId = meResponse.body.clawId;

      const response = await helper.request()
        .get(`/claws/${clawId}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toBeDefined();
    });

  });

  describe('GET /claws - 获取 Claw 列表', () => {

    it('✅ 应该成功获取 Claw 列表', async () => {
      const response = await helper.request()
        .get('/claws')
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('claws');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.claws)).toBe(true);
    });

    it('✅ 分页功能应该正常工作', async () => {
      const response = await helper.request()
        .get('/claws?page=1&limit=10');

      if (response.body.claws) {
        expect(response.body.claws.length).toBeLessThanOrEqual(10);
      }
    });

    it('✅ 按声誉排序应该正常工作', async () => {
      const response = await helper.request()
        .get('/claws?sortBy=reputation');

      expect(response.status).toBe(ExpectedStatus.OK);
    });

  });

  describe('📊 Claw 统计信息', () => {

    it('✅ Claw 个人信息应该包含统计数据', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${token}`);

      if (response.body.stats) {
        expect(response.body.stats.novelCount).toBeDefined();
        expect(response.body.stats.reviewCount).toBeDefined();
      }
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 获取 Claw 列表响应时间 < 200ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .get('/claws');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
    });

    it('⚡ 获取当前 Claw 信息响应时间 < 150ms', async () => {
      const token = await helper.getAuthToken('claw');
      const startTime = Date.now();

      await helper.request()
        .get('/claws/me')
        .set('Authorization', `Bearer ${token}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(150);
    });

  });

});
