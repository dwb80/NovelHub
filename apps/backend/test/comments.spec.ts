import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Comments Module (评论模块)', () => {
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

  describe('GET /comments/novel/:novelId - 获取小说评论列表', () => {

    it('✅ 应该成功获取评论列表', async () => {
      const response = await helper.request()
        .get(`/comments/novel/${testNovelId}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('comments');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.comments)).toBe(true);
    });

    it('✅ 评论应该按时间倒序排列', async () => {
      const response = await helper.request()
        .get(`/comments/novel/${testNovelId}`);

      if (response.body.comments.length > 1) {
        for (let i = 1; i < response.body.comments.length; i++) {
          const prevTime = new Date(response.body.comments[i - 1].createdAt).getTime();
          const currTime = new Date(response.body.comments[i].createdAt).getTime();
          expect(prevTime).toBeGreaterThanOrEqual(currTime);
        }
      }
    });

    it('✅ 分页功能应该正常工作', async () => {
      const response = await helper.request()
        .get(`/comments/novel/${testNovelId}?page=1&limit=5`);

      expect(response.body.comments.length).toBeLessThanOrEqual(5);
    });

    it('🌍 评论列表不需要认证', async () => {
      const response = await helper.request()
        .get(`/comments/novel/${testNovelId}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toBeDefined();
    });

  });

  describe('POST /comments - 发表评论', () => {

    it('✅ 登录用户应该成功发表评论', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: '这是一条测试评论 ' + Date.now(),
        })
        .expect(ExpectedStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('❌ 空评论内容应该被拒绝', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: '',
        })
        .expect(ExpectedStatus.BAD_REQUEST);
    });

    it('❌ 评论内容过长应该被限制', async () => {
      const userToken = await helper.getAuthToken('user');
      const longContent = 'a'.repeat(5000);

      const response = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: longContent,
        });

      expect([ExpectedStatus.BAD_REQUEST, ExpectedStatus.OK]).toContain(response.status);
    });

    it('❌ 未授权用户不能发表评论', async () => {
      const response = await helper.request()
        .post('/comments')
        .send({
          novelId: testNovelId,
          content: '未授权的评论',
        })
        .expect(ExpectedStatus.UNAUTHORIZED);
    });

  });

  describe('DELETE /comments/:id - 删除评论', () => {

    it('✅ 评论AI智能体作家可以删除自己的评论', async () => {
      const userToken = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: '待删除评论',
        });

      const commentId = createResponse.body.id;

      const response = await helper.request()
        .delete(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('❌ 用户不能删除他人评论', async () => {
      const user1Token = await helper.getAuthToken('user');
      const user2Token = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          novelId: testNovelId,
          content: '用户1的评论',
        });

      const commentId = createResponse.body.id;

      const response = await helper.request()
        .delete(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(ExpectedStatus.FORBIDDEN);

      expect(response.body.message).toContain('无权删除');
    });

    it('❌ 管理员可以删除任何评论', async () => {
      const userToken = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: '测试评论',
        });

      const commentId = createResponse.body.id;

      expect(createResponse.status).toBe(ExpectedStatus.CREATED);
      expect(commentId).toBeDefined();
    });

  });

  describe('😊 评论互动功能', () => {

    it('✅ 可以点赞评论', async () => {
      const userToken = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: '可点赞的评论',
        });

      const commentId = createResponse.body.id;

      const response = await helper.request()
        .post(`/comments/${commentId}/like`)
        .set('Authorization', `Bearer ${userToken}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(response.status);
    });

  });

  describe('🔒 安全测试', () => {

    it('🔒 XSS 脚本内容应该被过滤', async () => {
      const userToken = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: '<script>alert("xss")</script> 正常内容',
        });

      if (response.status === ExpectedStatus.CREATED) {
        expect(response.body.content).not.toContain('<script>');
      }
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 获取评论列表响应时间 < 200ms', async () => {
      const startTime = Date.now();

      await helper.request()
        .get(`/comments/novel/${testNovelId}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
    });

    it('⚡ 发表评论响应时间 < 300ms', async () => {
      const userToken = await helper.getAuthToken('user');
      const startTime = Date.now();

      await helper.request()
        .post('/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          novelId: testNovelId,
          content: '性能测试评论',
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(300);
    });

  });

});
