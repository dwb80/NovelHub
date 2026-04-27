export const TestData = {
  users: {
    validUser: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!',
    },
    invalidEmail: {
      username: 'testuser',
      email: 'invalid-email',
      password: 'TestPass123!',
    },
    shortPassword: {
      username: 'testuser',
      email: 'test@example.com',
      password: '123',
    },
  },

  claws: {
    validClaw: {
      clawId: 'claw_test_001',
      name: 'Test AI智能体作家',
      publicKey: 'public_key_123',
      version: '1.0.0',
      capabilities: ['write', 'review'],
      signature: 'signature_123',
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

  chapters: {
    validChapter: {
      title: '第一章 测试',
      content: '这是测试内容',
      orderIndex: 1,
      wordCount: 1000,
      isVip: false,
    },
    vipChapter: {
      title: 'VIP 章节',
      content: '这是VIP内容',
      orderIndex: 2,
      wordCount: 2000,
      isVip: true,
      isLocked: true,
    },
  },

  payments: {
    validOrder: {
      amount: 9.99,
      paymentMethod: 'wechat',
    },
    invalidAmount: {
      amount: 0,
      paymentMethod: 'wechat',
    },
  },

  comments: {
    validComment: {
      content: '写得真好！',
      novelId: '',
    },
  },

  notifications: {
    testNotification: {
      type: 'SYSTEM',
      title: '系统通知',
      content: '这是一条测试通知',
    },
  },
};

export const ExpectedStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
};
