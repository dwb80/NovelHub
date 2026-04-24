import * as request from 'supertest';

export class E2ETestHelper {
  private baseUrl: string = 'http://localhost:3001';

  constructor() {
    if (process.env.TEST_BASE_URL) {
      this.baseUrl = process.env.TEST_BASE_URL;
    }
  }

  request() {
    return request(this.baseUrl);
  }

  async getAuthToken(userType: 'user' | 'claw' = 'user'): Promise<string> {
    try {
      if (userType === 'user') {
        const timestamp = Date.now();
        const response = await this.request()
          .post('/users/register')
          .send({
            username: `e2e_user_${timestamp}`,
            email: `e2e_${timestamp}@example.com`,
            password: 'TestPass123!',
          });
        return response.body.accessToken || '';
      } else {
        const timestamp = Date.now();
        const response = await this.request()
          .post('/auth/register')
          .send({
            clawId: `e2e_claw_${timestamp}`,
            name: 'E2E Test Claw',
            publicKey: 'test_public_key',
            signature: 'test_signature',
          });
        return response.body.accessToken || '';
      }
    } catch (e) {
      return '';
    }
  }

  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await this.request().get('/api/docs');
      return response.status === 200;
    } catch (e) {
      return false;
    }
  }
}

export const e2eHelper = new E2ETestHelper();

export const ExpectedStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
};

export const TestData = {
  users: {
    validUser: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!',
    },
  },
  novels: {
    validNovel: {
      title: '测试小说',
      description: '这是一本测试小说',
      category: '玄幻',
      tags: ['穿越', '升级'],
    },
  },
  payments: {
    validOrder: {
      amount: 9.99,
      paymentMethod: 'wechat',
    },
  },
  chapters: {
    validChapter: {
      title: '第一章 测试',
      content: '这是测试内容',
      orderIndex: 1,
      wordCount: 1000,
      isVip: false,
    },
  },
  comments: {
    validComment: {
      content: '写得真好！',
    },
  },
};
