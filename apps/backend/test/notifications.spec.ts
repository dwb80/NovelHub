import { TestHelper } from './test-helper';
import { ExpectedStatus } from './test-data';

describe('Notifications Module (通知模块)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('GET /notifications - 获取通知列表', () => {

    it('✅ 应该成功获取用户通知列表', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('unreadCount');
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    it('✅ 未读筛选功能应该正常工作', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('notifications');
    });

    it('✅ 分页功能应该正常工作', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/notifications?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.notifications.length).toBeLessThanOrEqual(10);
    });

    it('❌ 未授权访问应该被拒绝', async () => {
      const response = await helper.request()
        .get('/notifications')
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供访问令牌');
    });

    it('✅ Claw 身份也应该可以获取通知', async () => {
      const token = await helper.getAuthToken('claw');

      const response = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('notifications');
    });

  });

  describe('PUT /notifications/:id/read - 标记通知已读', () => {

    it('✅ 应该成功标记通知为已读', async () => {
      const token = await helper.getAuthToken('user');

      const listResponse = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`);

      if (listResponse.body.notifications.length > 0) {
        const notificationId = listResponse.body.notifications[0].id;

        const response = await helper.request()
          .put(`/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${token}`)
          .expect(ExpectedStatus.OK);

        expect(response.body.isRead).toBe(true);
        expect(response.body.readAt).toBeDefined();
      }
    });

    it('❌ 标记他人通知应该被拒绝', async () => {
      const user1Token = await helper.getAuthToken('user');
      const user2Token = await helper.getAuthToken('user');

      const listResponse = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      if (listResponse.body.notifications.length > 0) {
        const notificationId = listResponse.body.notifications[0].id;

        const response = await helper.request()
          .put(`/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(ExpectedStatus.FORBIDDEN);

        expect(response.body.message).toContain('无权访问');
      }
    });

    it('❌ 不存在的通知应该返回 404', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .put('/notifications/non_existent_id/read')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.NOT_FOUND);

      expect(response.body.message).toContain('通知不存在');
    });

  });

  describe('PUT /notifications/read-all - 标记全部已读', () => {

    it('✅ 应该成功标记所有通知为已读', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .put('/notifications/read-all')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });

    it('❌ 未授权访问应该被拒绝', async () => {
      const response = await helper.request()
        .put('/notifications/read-all')
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供访问令牌');
    });

  });

  describe('DELETE /notifications/:id - 删除通知', () => {

    it('✅ 应该成功删除通知', async () => {
      const token = await helper.getAuthToken('user');

      const listResponse = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`);

      if (listResponse.body.notifications.length > 0) {
        const notificationId = listResponse.body.notifications[0].id;

        const response = await helper.request()
          .delete(`/notifications/${notificationId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(ExpectedStatus.OK);

        expect(response.body.success).toBe(true);
      }
    });

    it('❌ 删除他人通知应该被拒绝', async () => {
      const user1Token = await helper.getAuthToken('user');
      const user2Token = await helper.getAuthToken('user');

      const listResponse = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      if (listResponse.body.notifications.length > 0) {
        const notificationId = listResponse.body.notifications[0].id;

        const response = await helper.request()
          .delete(`/notifications/${notificationId}`)
          .set('Authorization', `Bearer ${user2Token}`)
          .expect(ExpectedStatus.FORBIDDEN);

        expect(response.body.message).toContain('无权删除');
      }
    });

  });

  describe('📬 通知类型测试', () => {

    it('✅ 应该支持所有通知类型', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      if (response.body.notifications.length > 0) {
        const validTypes = [
          'REVIEW_ASSIGNED',
          'REVIEW_COMPLETED',
          'NOVEL_PUBLISHED',
          'CHAPTER_PUBLISHED',
          'NOVEL_APPROVED',
          'NOVEL_REJECTED',
          'EVOLUTION_COMPLETED',
          'SYSTEM',
          'PAYMENT_SUCCESS',
          'PAYMENT_FAILED',
        ];

        response.body.notifications.forEach((notification: any) => {
          expect(validTypes).toContain(notification.type);
        });
      }
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 获取通知列表响应时间应该小于 200ms', async () => {
      const token = await helper.getAuthToken('user');
      const startTime = Date.now();

      await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
    });

    it('⚡ 标记已读响应时间应该小于 150ms', async () => {
      const token = await helper.getAuthToken('user');

      const listResponse = await helper.request()
        .get('/notifications')
        .set('Authorization', `Bearer ${token}`);

      if (listResponse.body.notifications.length > 0) {
        const notificationId = listResponse.body.notifications[0].id;
        const startTime = Date.now();

        await helper.request()
          .put(`/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${token}`);

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(150);
      }
    });

  });

});
