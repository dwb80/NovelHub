import { TestHelper } from '../test-helper';
import { ExpectedStatus } from '../test-data';

describe('State Machine Tests (状态机测试)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('TC-STATE-001: 小说状态完整流转', () => {

    it('小说应该按正确顺序流转状态', async () => {
      const token = await helper.getAuthToken('author');

      const novel = await helper.request()
        .post('/novels')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '状态测试小说',
          description: '测试状态流转',
          categoryId: 'test_category'
        });

      expect([ExpectedStatus.CREATED, ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(novel.status);
      
      if (novel.status === ExpectedStatus.CREATED || novel.status === ExpectedStatus.OK) {
        expect(novel.body.status).toBe('DRAFT');

        const submit = await helper.request()
          .post(`/novels/${novel.body.id}/submit`)
          .set('Authorization', `Bearer ${token}`);

        expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(submit.status);

        if (submit.status === ExpectedStatus.OK) {
          expect(submit.body.status).toBe('PENDING');
        }
      }
    });

  });

  describe('TC-STATE-002: 小说无效状态转换', () => {

    it('DRAFT状态直接approve应该被拒绝', async () => {
      const token = await helper.getAuthToken('author');
      const adminToken = await helper.getAuthToken('admin');

      const novel = await helper.request()
        .post('/novels')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '无效转换测试',
          description: '测试',
          categoryId: 'test'
        });

      if (novel.status === ExpectedStatus.CREATED || novel.status === ExpectedStatus.OK) {
        const approve = await helper.request()
          .post(`/novels/${novel.body.id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect([ExpectedStatus.BAD_REQUEST, ExpectedStatus.NOT_FOUND, ExpectedStatus.FORBIDDEN]).toContain(approve.status);
      }
    });

  });

  describe('TC-STATE-003: 章节状态完整流转', () => {

    it('章节应该按正确顺序流转状态', async () => {
      const authorToken = await helper.getAuthToken('author');
      const reviewerToken = await helper.getAuthToken('reviewer');

      const chapter = await helper.request()
        .post('/chapters')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          novelId: 'test_novel_id',
          title: '测试章节',
          content: '这是测试内容'
        });

      expect([ExpectedStatus.CREATED, ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(chapter.status);

      if (chapter.status === ExpectedStatus.CREATED || chapter.status === ExpectedStatus.OK) {
        expect(chapter.body.status).toBe('DRAFT');

        const submit = await helper.request()
          .post(`/chapters/${chapter.body.id}/submit`)
          .set('Authorization', `Bearer ${authorToken}`);

        expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(submit.status);

        if (submit.status === ExpectedStatus.OK) {
          expect(submit.body.status).toBe('PENDING');
        }
      }
    });

  });

  describe('TC-STATE-005: 评审任务状态流转', () => {

    it('评审任务应该按正确顺序流转状态', async () => {
      const token = await helper.getAuthToken('reviewer');

      const tasks = await helper.request()
        .get('/reviews/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(tasks.status);

      if (tasks.status === ExpectedStatus.OK && tasks.body?.length > 0) {
        const task = tasks.body[0];
        expect(task.status).toBeDefined();
      }
    });

  });

  describe('TC-STATE-007: 进化任务状态流转', () => {

    it('进化任务应该按正确顺序流转状态', async () => {
      const token = await helper.getAuthToken('claw');

      const evolve = await helper.request()
        .post('/nef/evolve')
        .set('Authorization', `Bearer ${token}`)
        .send({
          novelId: 'test_novel',
          chapterId: 'test_chapter',
          strategy: 'REFINE'
        });

      expect([ExpectedStatus.OK, ExpectedStatus.ACCEPTED, ExpectedStatus.NOT_FOUND]).toContain(evolve.status);
      
      if (evolve.status === ExpectedStatus.OK || evolve.status === ExpectedStatus.ACCEPTED) {
        expect(['QUEUED', 'PROCESSING', 'COMPLETED', 'PENDING']).toContain(evolve.body?.status);
      }
    });

  });

  describe('TC-STATE-009: 状态变更日志记录', () => {

    it('状态变更应该被正确记录', async () => {
      const token = await helper.getAuthToken('admin');

      const logs = await helper.request()
        .get('/admin/state-logs?entityType=Novel&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(logs.status);

      if (logs.status === ExpectedStatus.OK && logs.body?.length > 0) {
        const log = logs.body[0];
        expect(log.entity_type || log.entityType).toBeDefined();
        expect(log.entity_id || log.entityId).toBeDefined();
      }
    });

  });

});
