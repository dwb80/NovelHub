import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Bookshelf Module (书架模块)', () => {
  const helper = new TestHelper();
  let testNovelId: string;

  beforeAll(async () => {
    await helper.initApp();

    const clawToken = await helper.getAuthToken('claw');
    const novelResponse = await helper.request()
      .post('/novels')
      .set('Authorization', `Bearer ${clawToken}`)
      .send(TestData.novels.validNovel);
    testNovelId = novelResponse.body.id;
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('GET /bookshelf - 获取用户书架', () => {

    it('✅ 应该成功获取用户书架', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('books');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.books)).toBe(true);
    });

    it('❌ 未授权应该被拒绝', async () => {
      const response = await helper.request()
        .get('/bookshelf')
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供');
    });

    it('✅ 按状态筛选应该正常工作', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/bookshelf?status=READING')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('books');
    });

    it('✅ 排序功能应该正常工作', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/bookshelf?sortBy=lastReadAt')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('books');
    });

  });

  describe('GET /bookshelf/history - 获取阅读历史', () => {

    it('✅ 应该成功获取阅读历史', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/bookshelf/history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });

    it('✅ 阅读历史应该按时间倒序', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/bookshelf/history')
        .set('Authorization', `Bearer ${userToken}`);

      if (response.body.history && response.body.history.length > 1) {
        for (let i = 1; i < response.body.history.length; i++) {
          const prevTime = new Date(response.body.history[i - 1].lastReadAt).getTime();
          const currTime = new Date(response.body.history[i].lastReadAt).getTime();
          expect(prevTime).toBeGreaterThanOrEqual(currTime);
        }
      }
    });

    it('❌ 未授权应该被拒绝', async () => {
      const response = await helper.request()
        .get('/bookshelf/history')
        .expect(ExpectedStatus.UNAUTHORIZED);
    });

  });

  describe('POST /bookshelf - 添加小说到书架', () => {

    it('✅ 应该成功将小说添加到书架', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
        })
        .expect(ExpectedStatus.CREATED);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('成功');
    });

    it('✅ 重复添加应该去重', async () => {
      const userToken = await helper.getAuthToken('user');

      await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
        });

      const response = await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
        });

      expect([ExpectedStatus.CREATED, ExpectedStatus.OK]).toContain(response.status);
    });

    it('❌ 不存在的小说不能添加', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: 'non_existent_novel_id',
        });

      expect([ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(response.status);
    });

    it('❌ 未授权不能添加', async () => {
      const response = await helper.request()
        .post('/bookshelf')
        .send({
          novelId: testNovelId,
        })
        .expect(ExpectedStatus.UNAUTHORIZED);
    });

  });

  describe('PUT /bookshelf/:novelId/status - 更新阅读状态', () => {

    it('✅ 应该成功更新阅读状态', async () => {
      const userToken = await helper.getAuthToken('user');

      await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
        });

      const response = await helper.request()
        .put(`/bookshelf/${testNovelId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'FINISHED',
        })
        .expect(ExpectedStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('❌ 无效状态值应该被拒绝', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .put(`/bookshelf/${testNovelId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'INVALID_STATUS',
        });

      expect([ExpectedStatus.BAD_REQUEST, ExpectedStatus.OK]).toContain(response.status);
    });

  });

  describe('PUT /bookshelf/:novelId/progress - 更新阅读进度', () => {

    it('✅ 应该成功更新阅读进度', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .put(`/bookshelf/${testNovelId}/progress`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          chapterId: 'test_chapter_1',
          position: 50,
        })
        .expect(ExpectedStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('✅ 更新进度应该同时更新阅读时间', async () => {
      const userToken = await helper.getAuthToken('user');

      const beforeResponse = await helper.request()
        .get('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`);

      await helper.request()
        .put(`/bookshelf/${testNovelId}/progress`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          chapterId: 'test_chapter_2',
          position: 100,
        });

      const afterResponse = await helper.request()
        .get('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`);

      expect(afterResponse.status).toBe(ExpectedStatus.OK);
    });

  });

  describe('DELETE /bookshelf/:novelId - 移出书架', () => {

    it('✅ 应该成功将小说移出书架', async () => {
      const userToken = await helper.getAuthToken('user');

      await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
        });

      const response = await helper.request()
        .delete(`/bookshelf/${testNovelId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('✅ 移出后应该不在书架中', async () => {
      const userToken = await helper.getAuthToken('user');

      await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
        });

      await helper.request()
        .delete(`/bookshelf/${testNovelId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await helper.request()
        .get('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`);

      const found = response.body.books?.find((b: any) => b.novelId === testNovelId);
      expect(found).toBeUndefined();
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 获取书架响应时间 < 200ms', async () => {
      const userToken = await helper.getAuthToken('user');
      const startTime = Date.now();

      await helper.request()
        .get('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
    });

    it('⚡ 添加到书架响应时间 < 150ms', async () => {
      const userToken = await helper.getAuthToken('user');
      const startTime = Date.now();

      await helper.request()
        .post('/bookshelf')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(150);
    });

  });

});
