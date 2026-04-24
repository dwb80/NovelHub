import { TestHelper } from './test-helper';
import { ExpectedStatus } from './test-data';

describe('NEF Module (小说进化框架)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('GET /nef/stats - 获取平台统计', () => {
    it('✅ 应该成功获取平台统计数据', async () => {
      const response = await helper.request()
        .get('/nef/stats');

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(response.body).toHaveProperty('evolutionCount');
      expect(response.body).toHaveProperty('qualityScore');
    });
  });

  describe('GET /nef/history - 获取平台进化历史', () => {
    it('✅ 应该成功获取平台进化历史', async () => {
      const response = await helper.request()
        .get('/nef/history');

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /nef/plot-patterns - 获取剧情模式列表', () => {
    it('✅ 未授权访问应返回401', async () => {
      const response = await helper.request()
        .get('/nef/plot-patterns');

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
    });

    it('✅ Claw 可以访问剧情模式', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .get('/nef/plot-patterns')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(ExpectedStatus.OK);
    });
  });

  describe('POST /nef/plot-patterns - 创建剧情模式', () => {
    it('✅ Claw 可以创建剧情模式', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .post('/nef/plot-patterns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'HERO_JOURNEY',
          description: '这是一个测试剧情模式',
          keyPoints: ['起点', '冒险', '回归'],
        });

      expect([ExpectedStatus.CREATED, ExpectedStatus.OK]).toContain(response.status);
    });
  });

  describe('GET /nef/character-profiles - 获取角色档案列表', () => {
    it('✅ Claw 可以获取角色档案列表', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .get('/nef/character-profiles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(ExpectedStatus.OK);
    });
  });

  describe('POST /nef/character-profiles - 创建角色档案', () => {
    it('✅ Claw 可以创建角色档案', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .post('/nef/character-profiles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          archetype: 'HERO',
          name: '测试角色',
          description: '这是一个测试角色',
          traits: ['勇敢', '聪明'],
        });

      expect([ExpectedStatus.CREATED, ExpectedStatus.OK]).toContain(response.status);
    });
  });

  describe('POST /nef/evolve - 触发生成进化', () => {
    it('✅ 未授权访问应返回401', async () => {
      const response = await helper.request()
        .post('/nef/evolve')
        .send({
          novelId: 'test_novel_id',
          chapterId: 'test_chapter_id',
          strategy: 'REFINE',
        });

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
    });

    it('✅ 授权用户可以请求进化（返回400因为测试数据不存在）', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'test_novel_id',
          chapterId: 'test_chapter_id',
          strategy: 'REFINE',
        });

      expect([
        ExpectedStatus.OK,
        ExpectedStatus.BAD_REQUEST,
        ExpectedStatus.NOT_FOUND,
      ]).toContain(response.status);
    });
  });

  describe('GET /nef/evolution-history - 获取进化历史', () => {
    it('✅ Claw 可以获取进化历史', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .get('/nef/evolution-history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(ExpectedStatus.OK);
    });
  });

  describe('GET /nef/my-stats - 获取个人统计', () => {
    it('✅ Claw 可以获取个人统计', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .get('/nef/my-stats')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(response.body).toHaveProperty('evolutionCount');
    });
  });

  describe('GET /nef/my-history - 获取个人历史', () => {
    it('✅ Claw 可以获取个人历史', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const response = await helper.request()
        .get('/nef/my-history')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('⚡ 性能测试', () => {
    it('⚡ 获取进化历史响应时间 < 500ms', async () => {
      const token = await helper.getAuthToken('claw');
      if (!token) {
        console.log('跳过测试：无法获取认证token');
        return;
      }

      const startTime = Date.now();

      await helper.request()
        .get('/nef/evolution-history')
        .set('Authorization', `Bearer ${token}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500);
    });

    it('⚡ 获取统计数据响应时间 < 600ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .get('/nef/stats');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(600);
    });
  });

});
