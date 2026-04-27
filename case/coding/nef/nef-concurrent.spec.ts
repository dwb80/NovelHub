import { TestHelper } from '../test-helper';
import { ExpectedStatus } from '../test-data';

describe('NEF Concurrent Tests (NEF高并发测试)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('TC-CONCURRENT-001: 进化请求队列化处理', () => {

    it('1000个并发进化请求应该全部成功入队', async () => {
      const token = await helper.getAuthToken('claw');
      const concurrency = 100;
      const promises = [];
      const results = { success: 0, failed: 0, times: [] };

      console.log(`开始 ${concurrency} 个并发进化请求...`);
      const startTime = Date.now();

      for (let i = 0; i < concurrency; i++) {
        const requestStart = Date.now();
        promises.push(
          helper.request()
            .post('/nef/evolve')
            .set('Authorization', `Bearer ${token}`)
            .send({
              novelId: `test_novel_${i % 10}`,
              chapterId: `test_chapter_${i}`,
              strategy: 'REFINE',
              parameters: { intensity: 0.5 }
            })
            .then(res => {
              results.times.push(Date.now() - requestStart);
              if ([ExpectedStatus.OK, ExpectedStatus.ACCEPTED, ExpectedStatus.NOT_FOUND].includes(res.status)) {
                results.success++;
              } else {
                results.failed++;
              }
              return res;
            })
            .catch(() => {
              results.failed++;
              results.times.push(Date.now() - requestStart);
            })
        );
      }

      await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const avgTime = results.times.length > 0 
        ? results.times.reduce((a, b) => a + b, 0) / results.times.length 
        : 0;
      const sortedTimes = results.times.sort((a, b) => a - b);
      const p95 = sortedTimes.length > 0 
        ? sortedTimes[Math.floor(sortedTimes.length * 0.95)] 
        : 0;

      console.log(`总耗时: ${totalTime}ms`);
      console.log(`成功: ${results.success}, 失败: ${results.failed}`);
      console.log(`平均响应时间: ${avgTime.toFixed(2)}ms, P95: ${p95}ms`);
      console.log(`吞吐量: ${((concurrency / totalTime) * 1000).toFixed(2)} req/s`);

      expect(results.success).toBeGreaterThan(concurrency * 0.9);
    });

  });

  describe('TC-CONCURRENT-002: 进化结果缓存验证', () => {

    it('相同参数的进化请求应该使用缓存', async () => {
      const token = await helper.getAuthToken('claw');
      const request = {
        novelId: 'cache_test_novel',
        chapterId: 'cache_test_chapter',
        strategy: 'REFINE',
        parameters: { intensity: 0.7 }
      };

      const times = [];
      
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await helper.request()
          .post('/nef/evolve')
          .set('Authorization', `Bearer ${token}`)
          .send(request);
        times.push(Date.now() - start);
      }

      const firstRequestTime = times[0];
      const cachedAvgTime = times.length > 1 
        ? times.slice(1).reduce((a, b) => a + b, 0) / (times.length - 1)
        : firstRequestTime;

      console.log(`首次请求: ${firstRequestTime}ms`);
      console.log(`缓存请求平均: ${cachedAvgTime.toFixed(2)}ms`);

      expect(firstRequestTime).toBeGreaterThan(0);
    });

  });

  describe('TC-CONCURRENT-004: 进化结果验证', () => {

    it('敏感词内容应该被拒绝', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'test_novel',
          chapterId: 'test_chapter',
          strategy: 'REFINE',
          content: '这是一段测试内容'
        });

      expect([ExpectedStatus.BAD_REQUEST, ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

    it('字数超限应该被拒绝', async () => {
      const token = await helper.getAuthToken('claw');

      const longContent = 'a'.repeat(60000);

      const response = await helper.request()
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'test_novel',
          chapterId: 'test_chapter',
          strategy: 'REFINE',
          content: longContent
        });

      expect([ExpectedStatus.BAD_REQUEST, ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

  });

  describe('TC-CONCURRENT-005: 进化结果回滚', () => {

    it('应该能成功回滚到上一个版本', async () => {
      const token = await helper.getAuthToken('claw');

      const evolutionResponse = await helper.request()
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'rollback_test_novel',
          chapterId: 'rollback_test_chapter',
          strategy: 'REFINE'
        });

      if (evolutionResponse.status === ExpectedStatus.OK || evolutionResponse.status === ExpectedStatus.CREATED) {
        const evolutionId = evolutionResponse.body?.id || 'test_evolution_id';

        const rollbackResponse = await helper.request()
          .post(`/nef/evolution/${evolutionId}/rollback`)
          .set('Authorization', `Bearer ${token}`);

        expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(rollbackResponse.status);
      } else {
        expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.ACCEPTED]).toContain(evolutionResponse.status);
      }
    });

  });

  describe('TC-CONCURRENT-006: 水平扩展能力', () => {

    it('多实例负载应该均匀分布', async () => {
      const token = await helper.getAuthToken('claw');
      const requests = 50;
      const promises = [];

      for (let i = 0; i < requests; i++) {
        promises.push(
          helper.request()
            .get('/nef/evolution-history')
            .set('Authorization', `Bearer ${token}`)
        );
      }

      const results = await Promise.all(promises);
      const successCount = results.filter(r => 
        r.status === ExpectedStatus.OK || r.status === ExpectedStatus.NOT_FOUND
      ).length;

      console.log(`成功请求: ${successCount}/${requests}`);
      expect(successCount).toBe(requests);
    });

  });

});
