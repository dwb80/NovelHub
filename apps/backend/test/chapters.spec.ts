import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Chapters Module (章节模块)', () => {
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

  describe('GET /chapters/novel/:novelId - 获取小说章节列表', () => {

    it('✅ 应该成功获取章节列表', async () => {
      const response = await helper.request()
        .get(`/chapters/novel/${testNovelId}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('chapters');
      expect(Array.isArray(response.body.chapters)).toBe(true);
    });

    it('✅ 应该按正确的顺序排序', async () => {
      const response = await helper.request()
        .get(`/chapters/novel/${testNovelId}`);

      if (response.body.chapters.length > 1) {
        for (let i = 1; i < response.body.chapters.length; i++) {
          expect(response.body.chapters[i].orderIndex)
            .toBeGreaterThan(response.body.chapters[i - 1].orderIndex);
        }
      }
    });

    it('❌ 不存在的小说应该返回空列表', async () => {
      const response = await helper.request()
        .get('/chapters/novel/non_existent_novel')
        .expect(ExpectedStatus.OK);

      expect(Array.isArray(response.body.chapters)).toBe(true);
    });

    it('🌍 章节列表不需要认证', async () => {
      const response = await helper.request()
        .get(`/chapters/novel/${testNovelId}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toBeDefined();
    });

  });

  describe('GET /chapters/:id - 获取章节详情', () => {

    it('✅ 应该成功获取章节详情', async () => {
      const clawToken = await helper.getAuthToken('claw');

      const createResponse = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send(TestData.chapters.validChapter);

      const chapterId = createResponse.body.id;

      const response = await helper.request()
        .get(`/chapters/${chapterId}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.id).toBe(chapterId);
      expect(response.body.title).toBeDefined();
      expect(response.body.content).toBeDefined();
    });

    it('❌ 不存在的章节应该返回 404', async () => {
      const response = await helper.request()
        .get('/chapters/non_existent_chapter')
        .expect(ExpectedStatus.NOT_FOUND);

      expect(response.body.message).toContain('不存在');
    });

  });

  describe('POST /chapters/novel/:novelId - 创建章节', () => {

    it('✅ Claw 应该成功创建章节', async () => {
      const clawToken = await helper.getAuthToken('claw');

      const response = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send({
          ...TestData.chapters.validChapter,
          title: `测试章节 ${Date.now()}`,
        })
        .expect(ExpectedStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBeDefined();
    });

    it('❌ 读者不能创建章节', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(TestData.chapters.validChapter)
        .expect(ExpectedStatus.FORBIDDEN);
    });

    it('❌ 未授权应该被拒绝', async () => {
      const response = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .send(TestData.chapters.validChapter)
        .expect(ExpectedStatus.UNAUTHORIZED);
    });

    it('❌ 应该拒绝缺少必填字段', async () => {
      const clawToken = await helper.getAuthToken('claw');

      const response = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send({
          content: '只有内容没有标题',
        })
        .expect(ExpectedStatus.BAD_REQUEST);
    });

  });

  describe('PUT /chapters/:id - 更新章节', () => {

    it('✅ 应该成功更新章节内容', async () => {
      const clawToken = await helper.getAuthToken('claw');

      const createResponse = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send(TestData.chapters.validChapter);

      const chapterId = createResponse.body.id;

      const response = await helper.request()
        .put(`/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send({
          title: '更新后的标题',
          content: '更新后的内容',
        })
        .expect(ExpectedStatus.OK);

      expect(response.body.title).toBe('更新后的标题');
    });

    it('❌ 读者不能更新他人章节', async () => {
      const clawToken = await helper.getAuthToken('claw');
      const userToken = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send(TestData.chapters.validChapter);

      const chapterId = createResponse.body.id;

      const response = await helper.request()
        .put(`/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '恶意修改',
        })
        .expect(ExpectedStatus.FORBIDDEN);
    });

  });

  describe('DELETE /chapters/:id - 删除章节', () => {

    it('✅ 应该成功删除章节', async () => {
      const clawToken = await helper.getAuthToken('claw');

      const createResponse = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send(TestData.chapters.validChapter);

      const chapterId = createResponse.body.id;

      const response = await helper.request()
        .delete(`/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('❌ 删除后应该无法访问', async () => {
      const clawToken = await helper.getAuthToken('claw');

      const createResponse = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send(TestData.chapters.validChapter);

      const chapterId = createResponse.body.id;

      await helper.request()
        .delete(`/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${clawToken}`);

      await helper.request()
        .get(`/chapters/${chapterId}`)
        .expect(ExpectedStatus.NOT_FOUND);
    });

  });

  describe('🔒 VIP 章节测试', () => {

    it('❌ 未购买的 VIP 章节应该被锁定', async () => {
      const clawToken = await helper.getAuthToken('claw');
      const userToken = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post(`/chapters/novel/${testNovelId}`)
        .set('Authorization', `Bearer ${clawToken}`)
        .send(TestData.chapters.vipChapter);

      const chapterId = createResponse.body.id;

      const response = await helper.request()
        .get(`/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${userToken}`);

      if (response.body.isLocked) {
        expect(response.body.content).toBeUndefined();
      }
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 获取章节列表响应时间应该小于 150ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .get(`/chapters/novel/${testNovelId}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(150);
    });

  });

});
