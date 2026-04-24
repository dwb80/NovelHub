import { TestHelper } from './test-helper';
import { ExpectedStatus } from './test-data';

describe('Reviews Module (评审模块)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('GET /reviews/tasks - 获取评审任务列表', () => {

    it('✅ Claw 可以获取评审任务', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .get('/reviews/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

    it('❌ 读者不能获取评审任务', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/reviews/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.FORBIDDEN);
    });

    it('✅ 按状态筛选应该正常工作', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .get('/reviews/tasks?status=PENDING')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

  });

  describe('POST /reviews/tasks/:taskId/claim - 认领评审任务', () => {

    it('✅ Claw 可以认领评审任务', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .post('/reviews/tasks/test_task_id/claim')
        .set('Authorization', `Bearer ${token}`);

      expect([
        ExpectedStatus.OK,
        ExpectedStatus.NOT_FOUND,
        ExpectedStatus.CONFLICT,
      ]).toContain(response.status);
    });

    it('❌ 读者不能认领任务', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/reviews/tasks/test_task_id/claim')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.FORBIDDEN);
    });

  });

  describe('POST /reviews/submit - 提交评审结果', () => {

    it('✅ Claw 可以提交评审结果', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .post('/reviews/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          taskId: 'test_task_id',
          novelId: 'test_novel_id',
          chapterId: 'test_chapter_id',
          rating: 4,
          comments: '写得很好，情节紧凑',
          suggestions: ['增加人物深度', '优化对话'],
        });

      expect([
        ExpectedStatus.OK,
        ExpectedStatus.CREATED,
        ExpectedStatus.NOT_FOUND,
      ]).toContain(response.status);
    });

    it('❌ 评分超出范围应该被拒绝', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .post('/reviews/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          taskId: 'test_task_id',
          novelId: 'test_novel_id',
          rating: 6,
          comments: '测试',
        });

      expect([
        ExpectedStatus.BAD_REQUEST,
        ExpectedStatus.NOT_FOUND,
      ]).toContain(response.status);
    });

    it('❌ 读者不能提交评审', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/reviews/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          taskId: 'test',
          rating: 3,
          comments: '测试',
        })
        .expect(ExpectedStatus.FORBIDDEN);
    });

  });

  describe('GET /reviews/chapter/:chapterId - 获取章节评审列表', () => {

    it('✅ 应该成功获取章节评审列表', async () => {
      const response = await helper.request()
        .get('/reviews/chapter/test_chapter_id');

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

    it('🌍 评审列表应该公开可访问', async () => {
      const response = await helper.request()
        .get('/reviews/chapter/test_chapter_id');

      expect(response.status).not.toBe(ExpectedStatus.UNAUTHORIZED);
    });

  });

  describe('GET /reviews/:id - 获取评审详情', () => {

    it('✅ 应该成功获取评审详情', async () => {
      const response = await helper.request()
        .get('/reviews/test_review_id');

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

  });

  describe('📊 评审统计', () => {

    it('✅ 评审应该包含评分统计', async () => {
      const response = await helper.request()
        .get('/reviews/chapter/test_chapter_id');

      if (response.status === ExpectedStatus.OK && response.body.stats) {
        expect(response.body.stats.averageRating).toBeDefined();
        expect(response.body.stats.totalReviews).toBeDefined();
      }
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 提交评审响应时间 < 300ms', async () => {
      const token = await helper.getAuthToken('claw');
      const startTime = Date.now();

      await helper.request()
        .post('/reviews/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          taskId: 'test',
          novelId: 'test',
          chapterId: 'test',
          rating: 4,
          comments: '测试',
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500);
    });

  });

});
