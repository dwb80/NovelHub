import { TestHelper } from './test-helper';
import { ExpectedStatus } from './test-data';

describe('Statistics Module (统计模块)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('GET /statistics/overview - 获取系统概览统计', () => {

    it('✅ 应该成功获取系统概览统计', async () => {
      const response = await helper.request()
        .get('/statistics/overview')
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('totalNovels');
      expect(response.body).toHaveProperty('totalChapters');
      expect(response.body).toHaveProperty('totalWords');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalClaws');
      expect(response.body).toHaveProperty('totalComments');
      expect(response.body).toHaveProperty('totalReviews');
      expect(response.body).toHaveProperty('totalPaymentAmount');
      expect(response.body).toHaveProperty('today');
      expect(response.body).toHaveProperty('yesterday');
    });

    it('✅ 所有统计字段应该为非负数', async () => {
      const response = await helper.request()
        .get('/statistics/overview');

      expect(response.body.totalNovels).toBeGreaterThanOrEqual(0);
      expect(response.body.totalChapters).toBeGreaterThanOrEqual(0);
      expect(response.body.totalWords).toBeGreaterThanOrEqual(0);
      expect(response.body.totalUsers).toBeGreaterThanOrEqual(0);
      expect(response.body.totalClaws).toBeGreaterThanOrEqual(0);
      expect(response.body.totalComments).toBeGreaterThanOrEqual(0);
      expect(response.body.totalReviews).toBeGreaterThanOrEqual(0);
      expect(response.body.totalPaymentAmount).toBeGreaterThanOrEqual(0);
    });

    it('✅ 今日和昨日统计应该包含完整字段', async () => {
      const response = await helper.request()
        .get('/statistics/overview');

      expect(response.body.today).toHaveProperty('date');
      expect(response.body.today).toHaveProperty('pageViews');
      expect(response.body.today).toHaveProperty('uniqueVisitors');
      expect(response.body.today).toHaveProperty('novelCount');
      expect(response.body.today).toHaveProperty('chapterCount');
      expect(response.body.today).toHaveProperty('userCount');
      expect(response.body.today).toHaveProperty('paymentCount');
      expect(response.body.today).toHaveProperty('paymentAmount');

      expect(response.body.yesterday).toHaveProperty('date');
    });

    it('🌍 概览接口不需要认证即可访问', async () => {
      const response = await helper.request()
        .get('/statistics/overview')
        .expect(ExpectedStatus.OK);

      expect(response.body).toBeDefined();
    });

  });

  describe('GET /statistics/daily - 获取每日统计', () => {

    it('✅ 应该成功获取每日统计数据', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/statistics/daily')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('✅ 日期范围筛选应该正常工作', async () => {
      const token = await helper.getAuthToken('user');
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await helper.request()
        .get(`/statistics/daily?startDate=${thirtyDaysAgo}&endDate=${today}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('❌ 未授权访问应该被拒绝', async () => {
      const response = await helper.request()
        .get('/statistics/daily')
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供访问令牌');
    });

  });

  describe('📊 数据准确性测试', () => {

    it('📊 创建用户后用户统计应该增加', async () => {
      const beforeResponse = await helper.request()
        .get('/statistics/overview');

      const beforeCount = beforeResponse.body.totalUsers;

      const timestamp = Date.now();
      await helper.request()
        .post('/users/register')
        .send({
          username: `stats_${timestamp}`,
          email: `stats_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const afterResponse = await helper.request()
        .get('/statistics/overview');

      const afterCount = afterResponse.body.totalUsers;

      expect(afterCount).toBeGreaterThanOrEqual(beforeCount + 1);
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 系统概览响应时间应该小于 200ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .get('/statistics/overview');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
    });

    it('⚡ 每日统计响应时间应该小于 300ms', async () => {
      const token = await helper.getAuthToken('user');
      const startTime = Date.now();

      await helper.request()
        .get('/statistics/daily')
        .set('Authorization', `Bearer ${token}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(300);
    });

  });

  describe('🔄 并发测试', () => {

    it('🔄 并发获取统计数据应该正常', async () => {
      const promises = [];
      const concurrency = 10;

      for (let i = 0; i < concurrency; i++) {
        promises.push(
          helper.request().get('/statistics/overview')
        );
      }

      const results = await Promise.all(promises);

      results.forEach(response => {
        expect(response.status).toBe(ExpectedStatus.OK);
        expect(response.body.totalNovels).toBeDefined();
      });
    });

  });

});
