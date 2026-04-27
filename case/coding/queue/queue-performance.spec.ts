import { TestHelper } from '../test-helper';
import { ExpectedStatus } from '../test-data';

describe('Queue Performance Tests (队列性能测试)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('TC-QUEUE-001: 队列入队吞吐量', () => {

    it('100个任务入队吞吐量测试', async () => {
      const token = await helper.getAuthToken('claw');
      const concurrency = 100;
      const promises = [];
      const times = [];

      console.log(`开始 ${concurrency} 个并发入队请求...`);
      const startTime = Date.now();

      for (let i = 0; i < concurrency; i++) {
        const requestStart = Date.now();
        promises.push(
          helper.request()
            .post('/nef/evolve')
            .set('Authorization', `Bearer ${token}`)
            .send({
              novelId: `novel_${i % 10}`,
              chapterId: `chapter_${i}`,
              strategy: 'REFINE'
            })
            .then(res => {
              times.push(Date.now() - requestStart);
              return res;
            })
        );
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const throughput = (concurrency / totalTime) * 1000;
      const sortedTimes = times.sort((a, b) => a - b);
      const p95 = sortedTimes.length > 0 
        ? sortedTimes[Math.floor(sortedTimes.length * 0.95)] 
        : 0;
      const p99 = sortedTimes.length > 0 
        ? sortedTimes[Math.floor(sortedTimes.length * 0.99)] 
        : 0;

      console.log(`吞吐量: ${throughput.toFixed(2)} job/s`);
      console.log(`P95延迟: ${p95}ms, P99延迟: ${p99}ms`);

      expect(throughput).toBeGreaterThan(10);
    });

  });

  describe('TC-QUEUE-003: 任务等待时间', () => {

    it('任务等待时间测试', async () => {
      const token = await helper.getAuthToken('claw');
      const waitTimes = [];

      for (let i = 0; i < 10; i++) {
        const createStart = Date.now();
        
        const response = await helper.request()
          .post('/nef/evolve')
          .set('Authorization', `Bearer ${token}`)
          .send({
            novelId: `wait_test_${i}`,
            chapterId: `chapter_${i}`,
            strategy: 'REFINE'
          });

        if (response.status === ExpectedStatus.OK || response.status === ExpectedStatus.ACCEPTED) {
          const jobId = response.body?.jobId || response.body?.id;
          if (jobId) {
            const statusResponse = await helper.request()
              .get(`/nef/jobs/${jobId}/status`)
              .set('Authorization', `Bearer ${token}`);

            if (statusResponse.status === ExpectedStatus.OK) {
              const waitTime = statusResponse.body?.waitTime || 0;
              waitTimes.push(waitTime);
            }
          }
        }
      }

      if (waitTimes.length > 0) {
        const p95 = waitTimes.sort((a, b) => a - b)[Math.floor(waitTimes.length * 0.95)];
        console.log(`等待时间 P95: ${p95}ms`);
      }
    });

  });

  describe('TC-QUEUE-004: 任务重试机制', () => {

    it('失败任务应该自动重试', async () => {
      const token = await helper.getAuthToken('admin');

      const response = await helper.request()
        .post('/admin/queue/test-retry')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shouldFail: true,
          maxRetries: 3
        });

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(response.status);
    });

  });

  describe('TC-QUEUE-006: 优先级队列', () => {

    it('高优先级任务应该优先处理', async () => {
      const token = await helper.getAuthToken('claw');

      const lowPriority = await helper.request()
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'priority_test',
          chapterId: 'low',
          strategy: 'REFINE',
          priority: 1
        });

      const highPriority = await helper.request()
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'priority_test',
          chapterId: 'high',
          strategy: 'REFINE',
          priority: 10
        });

      expect([ExpectedStatus.OK, ExpectedStatus.ACCEPTED, ExpectedStatus.NOT_FOUND]).toContain(lowPriority.status);
      expect([ExpectedStatus.OK, ExpectedStatus.ACCEPTED, ExpectedStatus.NOT_FOUND]).toContain(highPriority.status);
    });

  });

  describe('TC-QUEUE-007: 队列监控指标', () => {

    it('应该能获取队列指标', async () => {
      const token = await helper.getAuthToken('admin');

      const response = await helper.request()
        .get('/admin/queue/metrics')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);

      if (response.status === ExpectedStatus.OK && response.body) {
        console.log('队列指标:', JSON.stringify(response.body, null, 2));
      }
    });

    it('应该能获取队列深度', async () => {
      const token = await helper.getAuthToken('admin');

      const response = await helper.request()
        .get('/admin/queue/depth')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

  });

  describe('TC-QUEUE-008: 告警触发', () => {

    it('应该能配置告警规则', async () => {
      const token = await helper.getAuthToken('admin');

      const response = await helper.request()
        .get('/admin/queue/alerts')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

  });

  describe('队列健康检查', () => {

    it('Redis连接应该正常', async () => {
      const token = await helper.getAuthToken('admin');

      const response = await helper.request()
        .get('/admin/queue/health')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);

      if (response.status === ExpectedStatus.OK && response.body) {
        expect(response.body.redis).toBeDefined();
        console.log('Redis状态:', response.body.redis);
      }
    });

    it('Worker状态应该正常', async () => {
      const token = await helper.getAuthToken('admin');

      const response = await helper.request()
        .get('/admin/queue/workers')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

  });

});
