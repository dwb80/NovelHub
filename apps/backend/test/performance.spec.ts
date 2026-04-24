import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Performance Tests (性能测试)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('📊 接口响应时间基准测试', () => {

    it('GET /statistics/overview 响应时间 < 100ms', async () => {
      const times = [];

      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await helper.request().get('/statistics/overview');
        const end = Date.now();
        times.push(end - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
      const p99 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.99)];

      console.log(`📊 /statistics/overview:`);
      console.log(`   平均: ${avg.toFixed(2)}ms`);
      console.log(`   P95: ${p95}ms`);
      console.log(`   P99: ${p99}ms`);

      expect(avg).toBeLessThan(100);
      expect(p95).toBeLessThan(150);
      expect(p99).toBeLessThan(200);
    });

    it('GET /novels 响应时间 < 150ms', async () => {
      const times = [];

      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await helper.request().get('/novels');
        const end = Date.now();
        times.push(end - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

      console.log(`📊 /novels:`);
      console.log(`   平均: ${avg.toFixed(2)}ms`);
      console.log(`   P95: ${p95}ms`);

      expect(avg).toBeLessThan(150);
      expect(p95).toBeLessThan(250);
    });

    it('POST /users/login 响应时间 < 200ms', async () => {
      const timestamp = Date.now();

      await helper.request()
        .post('/users/register')
        .send({
          username: `perf_${timestamp}`,
          email: `perf_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const times = [];

      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await helper.request()
          .post('/users/login')
          .send({
            emailOrUsername: `perf_${timestamp}@example.com`,
            password: 'TestPass123!',
          });
        const end = Date.now();
        times.push(end - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;

      console.log(`📊 /users/login:`);
      console.log(`   平均: ${avg.toFixed(2)}ms`);

      expect(avg).toBeLessThan(200);
    });

    it('POST /users/register 响应时间 < 300ms', async () => {
      const times = [];

      for (let i = 0; i < 5; i++) {
        const timestamp = Date.now() + i;
        const start = Date.now();
        await helper.request()
          .post('/users/register')
          .send({
            username: `perf${timestamp}`,
            email: `perf${timestamp}@example.com`,
            password: 'TestPass123!',
          });
        const end = Date.now();
        times.push(end - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;

      console.log(`📊 /users/register:`);
      console.log(`   平均: ${avg.toFixed(2)}ms`);

      expect(avg).toBeLessThan(300);
    });

  });

  describe('⚡ 并发压力测试', () => {

    it('50 并发请求小说列表应该全部成功', async () => {
      const concurrency = 50;
      const promises = [];

      console.log(`⚡ 开始 ${concurrency} 并发请求...`);
      const start = Date.now();

      for (let i = 0; i < concurrency; i++) {
        promises.push(helper.request().get('/novels'));
      }

      const results = await Promise.all(promises);
      const end = Date.now();
      const totalTime = end - start;

      const successCount = results.filter(r => r.status === ExpectedStatus.OK).length;
      const errorCount = results.filter(r => r.status >= 400).length;

      console.log(`   总耗时: ${totalTime}ms`);
      console.log(`   成功: ${successCount}`);
      console.log(`   失败: ${errorCount}`);
      console.log(`   吞吐量: ${((concurrency / totalTime) * 1000).toFixed(2)} req/s`);

      expect(successCount).toBe(concurrency);
      expect(totalTime).toBeLessThan(5000);
    });

    it('30 并发用户登录应该全部成功', async () => {
      const timestamp = Date.now();

      await helper.request()
        .post('/users/register')
        .send({
          username: `concurrent_${timestamp}`,
          email: `concurrent_${timestamp}@example.com`,
          password: 'TestPass123!',
        });

      const concurrency = 30;
      const promises = [];

      console.log(`⚡ 开始 ${concurrency} 并发登录请求...`);
      const start = Date.now();

      for (let i = 0; i < concurrency; i++) {
        promises.push(
          helper.request()
            .post('/users/login')
            .send({
              emailOrUsername: `concurrent_${timestamp}@example.com`,
              password: 'TestPass123!',
            })
        );
      }

      const results = await Promise.all(promises);
      const end = Date.now();
      const totalTime = end - start;

      const successCount = results.filter(r => r.status === ExpectedStatus.OK).length;

      console.log(`   总耗时: ${totalTime}ms`);
      console.log(`   成功: ${successCount}/${concurrency}`);
      console.log(`   吞吐量: ${((concurrency / totalTime) * 1000).toFixed(2)} req/s`);

      expect(successCount).toBe(concurrency);
    });

    it('100 并发请求搜索接口应该正常响应', async () => {
      const concurrency = 100;
      const promises = [];

      console.log(`⚡ 开始 ${concurrency} 并发搜索请求...`);
      const start = Date.now();

      for (let i = 0; i < concurrency; i++) {
        promises.push(helper.request().get('/search/novels?q=测试'));
      }

      const results = await Promise.all(promises);
      const end = Date.now();
      const totalTime = end - start;

      const successCount = results.filter(r => r.status === ExpectedStatus.OK).length;

      console.log(`   总耗时: ${totalTime}ms`);
      console.log(`   成功: ${successCount}/${concurrency}`);
      console.log(`   吞吐量: ${((concurrency / totalTime) * 1000).toFixed(2)} req/s`);

      expect(successCount).toBeGreaterThanOrEqual(concurrency * 0.95);
    });

  });

  describe('📈 持续压力测试', () => {

    it('连续 1000 次请求无错误', async () => {
      const totalRequests = 1000;
      const errors = [];
      const times = [];

      console.log(`📈 开始 ${totalRequests} 次连续请求...`);

      for (let i = 0; i < totalRequests; i++) {
        const start = Date.now();
        try {
          const response = await helper.request().get('/novels');
          if (response.status !== ExpectedStatus.OK) {
            errors.push({ index: i, status: response.status });
          }
        } catch (e) {
          errors.push({ index: i, error: e.message });
        }
        const end = Date.now();
        times.push(end - start);
      }

      const avg = times.reduce((a, b) => a + b, 0) / times.length;

      console.log(`   错误数: ${errors.length}`);
      console.log(`   平均响应时间: ${avg.toFixed(2)}ms`);
      console.log(`   总吞吐量: ${((totalRequests / (times.reduce((a, b) => a + b, 0) / 1000))).toFixed(2)} req/s`);

      expect(errors.length).toBe(0);
    });

  });

  describe('🔍 错误率测试', () => {

    it('1000 次请求错误率应该 < 0.1%', async () => {
      const totalRequests = 1000;
      let errorCount = 0;

      for (let i = 0; i < totalRequests; i++) {
        try {
          const response = await helper.request().get('/novels');
          if (response.status >= 400) {
            errorCount++;
          }
        } catch (e) {
          errorCount++;
        }
      }

      const errorRate = (errorCount / totalRequests) * 100;

      console.log(`🔍 错误率: ${errorRate}% (${errorCount}/${totalRequests})`);

      expect(errorRate).toBeLessThan(0.1);
    });

  });

});
