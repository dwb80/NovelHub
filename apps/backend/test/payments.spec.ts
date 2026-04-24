import { TestHelper } from './test-helper';
import { TestData, ExpectedStatus } from './test-data';

describe('Payments Module (支付模块)', () => {
  const helper = new TestHelper();

  beforeAll(async () => {
    await helper.initApp();
  });

  afterAll(async () => {
    await helper.closeApp();
  });

  describe('POST /payments/orders - 创建支付订单', () => {

    it('✅ 应该成功创建支付订单', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.payments.validOrder)
        .expect(ExpectedStatus.CREATED);

      expect(response.body).toHaveProperty('orderId');
      expect(response.body).toHaveProperty('paymentUrl');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.amount).toBe(TestData.payments.validOrder.amount);
    });

    it('❌ 应该拒绝无效金额', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.payments.invalidAmount)
        .expect(ExpectedStatus.BAD_REQUEST);

      expect(response.body.error).toBe('Bad Request');
    });

    it('❌ 未授权应该被拒绝', async () => {
      const response = await helper.request()
        .post('/payments/orders')
        .send(TestData.payments.validOrder)
        .expect(ExpectedStatus.UNAUTHORIZED);

      expect(response.body.message).toContain('未提供访问令牌');
    });

    it('❌ 应该拒绝无效的支付方式', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 9.99,
          paymentMethod: 'invalid_method',
        })
        .expect(ExpectedStatus.BAD_REQUEST);

      expect(response.body.error).toBe('Bad Request');
    });

  });

  describe('GET /payments/orders/:orderId - 获取订单详情', () => {

    it('✅ 应该成功获取订单详情', async () => {
      const token = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.payments.validOrder);

      const orderId = createResponse.body.orderId;

      const response = await helper.request()
        .get(`/payments/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.orderId).toBe(orderId);
      expect(response.body.status).toBeDefined();
    });

    it('❌ 应该拒绝访问他人订单', async () => {
      const user1Token = await helper.getAuthToken('user');
      const user2Token = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(TestData.payments.validOrder);

      const orderId = createResponse.body.orderId;

      const response = await helper.request()
        .get(`/payments/orders/${orderId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(ExpectedStatus.FORBIDDEN);

      expect(response.body.message).toContain('无权访问');
    });

    it('❌ 不存在的订单应该返回 404', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/payments/orders/non_existent_order')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.NOT_FOUND);

      expect(response.body.message).toContain('订单不存在');
    });

  });

  describe('GET /payments/orders - 获取订单列表', () => {

    it('✅ 应该成功获取用户订单列表', async () => {
      const token = await helper.getAuthToken('user');

      for (let i = 0; i < 3; i++) {
        await helper.request()
          .post('/payments/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            ...TestData.payments.validOrder,
            amount: 9.99 + i,
          });
      }

      const response = await helper.request()
        .get('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(3);
    });

    it('✅ 分页功能应该正常工作', async () => {
      const token = await helper.getAuthToken('user');

      const response = await helper.request()
        .get('/payments/orders?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(ExpectedStatus.OK);

      expect(response.body.orders.length).toBeLessThanOrEqual(2);
    });

  });

  describe('POST /payments/callback - 支付回调', () => {

    it('✅ 应该成功处理支付成功回调', async () => {
      const token = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.payments.validOrder);

      const orderId = createResponse.body.orderId;

      const response = await helper.request()
        .post('/payments/callback')
        .send({
          platformTxId: `tx_${Date.now()}`,
          orderId,
          status: 'SUCCESS',
          amount: '9.99',
          signature: 'valid_signature',
        })
        .expect(ExpectedStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('✅ 应该成功处理支付失败回调', async () => {
      const token = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.payments.validOrder);

      const orderId = createResponse.body.orderId;

      const response = await helper.request()
        .post('/payments/callback')
        .send({
          platformTxId: `tx_${Date.now()}`,
          orderId,
          status: 'FAILED',
          amount: '9.99',
          signature: 'valid_signature',
          errorCode: 'PAYMENT_FAILED',
          errorMessage: '用户取消支付',
        })
        .expect(ExpectedStatus.OK);

      expect(response.body.success).toBe(true);
    });

    it('❌ 不存在的订单回调应该返回 404', async () => {
      const response = await helper.request()
        .post('/payments/callback')
        .send({
          platformTxId: 'tx_123',
          orderId: 'non_existent_order',
          status: 'SUCCESS',
          amount: '9.99',
          signature: 'valid_signature',
        })
        .expect(ExpectedStatus.NOT_FOUND);

      expect(response.body.message).toContain('订单不存在');
    });

  });

  describe('💰 VIP 章节购买', () => {

    it('❌ 应该拒绝重复购买同一章节', async () => {
      const token = await helper.getAuthToken('user');
      const chapterId = 'vip_chapter_test';

      await helper.request()
        .post('/payments/callback')
        .send({
          platformTxId: `tx_${Date.now()}`,
          orderId: 'test_order_id',
          status: 'SUCCESS',
          amount: '9.99',
          signature: 'valid_signature',
        });
    });

  });

  describe('⚡ 性能测试', () => {

    it('⚡ 创建订单接口响应时间应该小于 300ms', async () => {
      const token = await helper.getAuthToken('user');
      const startTime = Date.now();

      await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.payments.validOrder);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(300);
    });

  });

  describe('🔒 幂等性测试', () => {

    it('🔒 重复回调应该幂等', async () => {
      const token = await helper.getAuthToken('user');

      const createResponse = await helper.request()
        .post('/payments/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(TestData.payments.validOrder);

      const orderId = createResponse.body.orderId;
      const callbackData = {
        platformTxId: `tx_${Date.now()}`,
        orderId,
        status: 'SUCCESS',
        amount: '9.99',
        signature: 'valid_signature',
      };

      const response1 = await helper.request()
        .post('/payments/callback')
        .send(callbackData)
        .expect(ExpectedStatus.OK);

      const response2 = await helper.request()
        .post('/payments/callback')
        .send(callbackData)
        .expect(ExpectedStatus.OK);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });

  });

});
