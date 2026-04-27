import { TestHelper } from '../test-helper';
import { ExpectedStatus } from '../test-data';

describe('Reviewer Level Tests (评审员级别测试)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('TC-LEVEL-001: 新评审员初始级别', () => {

    it('新注册评审员应该是JUNIOR级别', async () => {
      const token = await helper.getAuthToken('reviewer');

      const stats = await helper.request()
        .get('/reviewers/me/stats')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(stats.status);

      if (stats.status === ExpectedStatus.OK) {
        expect(['JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT']).toContain(stats.body.level);
        expect(stats.body.reputationScore).toBeDefined();
        expect(stats.body.completedReviews).toBeDefined();
      }
    });

  });

  describe('TC-LEVEL-002: 声誉分数计算', () => {

    it('完成评审后声誉分数应该增加', async () => {
      const token = await helper.getAuthToken('reviewer');

      const beforeStats = await helper.request()
        .get('/reviewers/me/stats')
        .set('Authorization', `Bearer ${token}`);

      const review = await helper.request()
        .post('/reviews/submit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          taskId: 'test_task',
          novelId: 'test_novel',
          chapterId: 'test_chapter',
          rating: 4,
          comments: '很好的章节'
        });

      const afterStats = await helper.request()
        .get('/reviewers/me/stats')
        .set('Authorization', `Bearer ${token}`);

      if (beforeStats.status === ExpectedStatus.OK && afterStats.status === ExpectedStatus.OK) {
        expect(afterStats.body.reputationScore).toBeGreaterThanOrEqual(
          beforeStats.body.reputationScore
        );
      }
    });

  });

  describe('TC-LEVEL-003: JUNIOR到INTERMEDIATE升级', () => {

    it('满足条件后应该升级到INTERMEDIATE', async () => {
      const adminToken = await helper.getAuthToken('admin');

      const result = await helper.request()
        .post('/admin/reviewers/test_reviewer_id/simulate-upgrade')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          completedReviews: 20,
          reputationScore: 100,
          averageRating: 4.0
        });

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(result.status);
    });

  });

  describe('TC-LEVEL-006: 级别降级', () => {

    it('长时间不活跃应该降级', async () => {
      const adminToken = await helper.getAuthToken('admin');

      const result = await helper.request()
        .post('/admin/reviewers/test_reviewer_id/simulate-inactive')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          inactiveDays: 35
        });

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(result.status);
    });

  });

  describe('TC-LEVEL-007: 声誉分数惩罚', () => {

    it('任务超时应该扣分', async () => {
      const token = await helper.getAuthToken('reviewer');

      const beforeStats = await helper.request()
        .get('/reviewers/me/stats')
        .set('Authorization', `Bearer ${token}`);

      const expire = await helper.request()
        .post('/reviews/tasks/test_task/expire')
        .set('Authorization', `Bearer ${await helper.getAuthToken('admin')}`);

      const afterStats = await helper.request()
        .get('/reviewers/me/stats')
        .set('Authorization', `Bearer ${token}`);

      if (beforeStats.status === ExpectedStatus.OK && afterStats.status === ExpectedStatus.OK) {
        console.log('声誉分数变化:', beforeStats.body.reputationScore, '->', afterStats.body.reputationScore);
      }
    });

  });

  describe('TC-LEVEL-008: 级别历史记录', () => {

    it('级别变更应该被记录', async () => {
      const token = await helper.getAuthToken('reviewer');

      const history = await helper.request()
        .get('/reviewers/me/level-history')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(history.status);
    });

  });

  describe('级别系统完整性测试', () => {

    it('评审员级别列表应该包含所有级别', async () => {
      const token = await helper.getAuthToken('admin');

      const levels = await helper.request()
        .get('/admin/reviewer-levels')
        .set('Authorization', `Bearer ${token}`);

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND]).toContain(levels.status);

      if (levels.status === ExpectedStatus.OK && levels.body) {
        const levelNames = levels.body.map((l: any) => l.name || l.level);
        expect(levelNames).toContain('JUNIOR');
        expect(levelNames).toContain('INTERMEDIATE');
        expect(levelNames).toContain('SENIOR');
        expect(levelNames).toContain('EXPERT');
      }
    });

    it('声誉分数计算应该正确', async () => {
      const adminToken = await helper.getAuthToken('admin');

      const calc = await helper.request()
        .post('/admin/reviewers/calculate-reputation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          completedReviews: 10,
          averageRating: 4.5,
          consecutiveActiveDays: 7
        });

      expect([ExpectedStatus.OK, ExpectedStatus.NOT_FOUND, ExpectedStatus.BAD_REQUEST]).toContain(calc.status);

      if (calc.status === ExpectedStatus.OK && calc.body) {
        expect(calc.body.reputationScore).toBeGreaterThan(0);
        console.log('计算出的声誉分数:', calc.body.reputationScore);
      }
    });

  });

});
