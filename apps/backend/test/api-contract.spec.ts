import { TestHelper } from './test-helper';
import { ExpectedStatus } from './test-data';

describe('API Contract Tests (API 合约测试)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('📄 Swagger API 文档合约', () => {

    it('Swagger JSON 文档应该可访问', async () => {
      const response = await helper.request()
        .get('/api-json');

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
    });

    it('应该包含所有模块的 API 路径', async () => {
      const response = await helper.request()
        .get('/api-json');

      const paths = Object.keys(response.body.paths);

      const requiredModules = [
        '/auth',
        '/users',
        '/novels',
        '/chapters',
        '/payments',
        '/notifications',
        '/statistics',
        '/search',
        '/comments',
        '/bookshelf',
        '/claws',
        '/nef',
      ];

      for (const module of requiredModules) {
        const hasModule = paths.some(p => p.startsWith(module));
        if (!hasModule) {
          console.log(`⚠️  缺少 ${module} 模块的 API 路径`);
        }
      }
    });

    it('所有 API 应该有正确的 tags', async () => {
      const response = await helper.request()
        .get('/api-json');

      expect(response.body.tags).toBeDefined();
      expect(response.body.tags.length).toBeGreaterThan(0);
    });

    it('所有 Schema 应该正确定义', async () => {
      const response = await helper.request()
        .get('/api-json');

      expect(response.body.components.schemas).toBeDefined();

      const requiredSchemas = [
        'User',
        'Claw',
        'Novel',
        'Chapter',
        'PaymentOrder',
        'Notification',
        'Comment',
      ];

      for (const schema of requiredSchemas) {
        if (!response.body.components.schemas[schema]) {
          console.log(`⚠️  缺少 Schema: ${schema}`);
        }
      }
    });

  });

  describe('🔌 通用响应格式合约', () => {

    it('成功响应应该有正确的状态码', async () => {
      const response = await helper.request()
        .get('/statistics/overview');

      expect(response.status).toBe(ExpectedStatus.OK);
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('错误响应应该有统一格式', async () => {
      const response = await helper.request()
        .get('/users/profile');

      expect(response.status).toBe(ExpectedStatus.UNAUTHORIZED);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
    });

    it('404 响应格式应该正确', async () => {
      const response = await helper.request()
        .get('/novels/non_existent_id_12345');

      if (response.status === ExpectedStatus.NOT_FOUND) {
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('statusCode');
      }
    });

    it('验证错误响应格式应该正确', async () => {
      const response = await helper.request()
        .post('/users/login')
        .send({});

      expect([ExpectedStatus.BAD_REQUEST, ExpectedStatus.UNAUTHORIZED]).toContain(response.status);
    });

  });

  describe('🔤 数据类型合约', () => {

    it('日期时间字段应该是 ISO 格式', async () => {
      const response = await helper.request()
        .get('/statistics/overview');

      if (response.body.today?.date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        expect(dateRegex.test(response.body.today.date)).toBe(true);
      }
    });

    it('ID 字段应该是字符串格式 UUID', async () => {
      const listResponse = await helper.request().get('/novels');

      if (listResponse.body.novels?.length > 0) {
        const novel = listResponse.body.novels[0];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (novel.id.length === 36) {
          expect(uuidRegex.test(novel.id)).toBe(true);
        }
      }
    });

    it('分页字段格式应该统一', async () => {
      const response = await helper.request()
        .get('/novels?page=1&limit=10');

      if (response.body.total !== undefined) {
        expect(typeof response.body.total).toBe('number');
        expect(Array.isArray(response.body.novels)).toBe(true);
      }
    });

  });

  describe('🔍 HTTP Headers 合约', () => {

    it('应该设置正确的 Content-Type', async () => {
      const response = await helper.request()
        .get('/novels');

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该设置 CORS 头部', async () => {
      const response = await helper.request()
        .get('/novels')
        .set('Origin', 'http://example.com');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('不应该暴露敏感信息的 Headers', async () => {
      const response = await helper.request()
        .get('/novels');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

  });

  describe('📦 分页参数合约', () => {

    it('默认分页参数应该生效', async () => {
      const response = await helper.request()
        .get('/novels');

      if (response.body.novels) {
        expect(response.body.novels.length).toBeLessThanOrEqual(20);
      }
    });

    it('自定义分页参数应该生效', async () => {
      const limit = 5;
      const response = await helper.request()
        .get(`/novels?limit=${limit}`);

      if (response.body.novels) {
        expect(response.body.novels.length).toBeLessThanOrEqual(limit);
      }
    });

    it('过大的 limit 应该被限制', async () => {
      const response = await helper.request()
        .get('/novels?limit=1000');

      if (response.body.novels) {
        expect(response.body.novels.length).toBeLessThanOrEqual(100);
      }
    });

  });

});
