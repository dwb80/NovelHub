import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Novels Module (小说模块)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('GET /novels - 获取小说列表', () => {

    it('✅ 应该成功获取小说列表', async () => {
      const response = await helper.request()
        .get('/novels')
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('novels');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.novels)).toBe(true);
    });

    it('✅ 分类筛选应该正常工作', async () => {
      const response = await helper.request()
        .get('/novels?category=玄幻')
        .expect(ExpectedStatus.OK);

      expect(Array.isArray(response.body.novels)).toBe(true);
    });

    it('✅ 状态筛选应该正常工作', async () => {
      const response = await helper.request()
        .get('/novels?status=PUBLISHED')
        .expect(ExpectedStatus.OK);

      expect(Array.isArray(response.body.novels)).toBe(true);
    });

    it('✅ 排序功能应该正常工作', async () => {
      const response = await helper.request()
        .get('/novels?sortBy=views')
        .expect(ExpectedStatus.OK);

      expect(Array.isArray(response.body.novels)).toBe(true);
    });

    it('✅ 分页功能应该正常工作', async () => {
      const response = await helper.request()
        .get('/novels?page=1&limit=10')
        .expect(ExpectedStatus.OK);

      expect(response.body.novels.length).toBeLessThanOrEqual(10);
    });

  });

  describe('GET /novels/:id - 获取小说详情', () => {

    it('✅ 应该成功获取小说详情', async () => {
      const listResponse = await helper.request().get('/novels');

      if (listResponse.body.novels.length > 0) {
        const novelId = listResponse.body.novels[0].id;

        const response = await helper.request()
          .get(`/novels/${novelId}`)
          .expect(ExpectedStatus.OK);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('title');
        expect(response.body).toHaveProperty('description');
        expect(response.body).toHaveProperty('author');
      }
    });

    it('❌ 不存在的小说应该返回 404', async () => {
      const response = await helper.request()
        .get('/novels/non_existent_id')
        .expect(ExpectedStatus.NOT_FOUND);

      expect(response.body.message).toContain('不存在');
    });

  });

  describe('POST /novels - 创建小说', () => {

    it('✅ 应该成功创建小说', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .post('/novels')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.novels.validNovel)
        .expect(ExpectedStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(TestData.novels.validNovel.title);
    });

    it('❌ 未授权应该被拒绝', async () => {
      const response = await helper.request()
        .post('/novels')
        .send(TestData.novels.validNovel)
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供访问令牌');
    });

    it('❌ 读者不能创建小说', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/novels')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.novels.validNovel)
        .expect(ExpectedStatus.FORBIDDEN);
    });

  });

  describe('🔍 搜索功能测试', () => {

    it('✅ 关键词搜索应该正常工作', async () => {
      const response = await helper.request()
        .get('/search/novels?q=测试')
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('novels');
      expect(Array.isArray(response.body.novels)).toBe(true);
    });

    it('✅ 空搜索关键词应该返回结果', async () => {
      const response = await helper.request()
        .get('/search/novels')
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('novels');
    });

    it('✅ 搜索结合筛选应该正常工作', async () => {
      const response = await helper.request()
        .get('/search/novels?q=测试&category=玄幻&minRating=3')
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('novels');
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 小说列表响应时间应该小于 200ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .get('/novels');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
    });

    it('⚡ 搜索响应时间应该小于 300ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .get('/search/novels?q=测试');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(300);
    });

  });

  describe('🔄 并发测试', () => {

    it('🔄 高并发访问小说列表应该正常', async () => {
      const promises = [];
      const concurrency = 20;

      for (let i = 0; i < concurrency; i++) {
        promises.push(
          helper.request().get('/novels')
        );
      }

      const results = await Promise.all(promises);

      results.forEach(response => {
        expect(response.status).toBe(ExpectedStatus.OK);
      });
    });

  });

});
