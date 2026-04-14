/**
 * 集成测试数据
 */

// 测试用户
export const testUsers = {
  user1: {
    id: 1,
    username: 'test_user_001',
    email: 'test001@example.com',
    password: 'Test@123456',
    nickname: '测试用户001',
    role: 'user'
  },
  user2: {
    id: 2,
    username: 'test_user_002',
    email: 'test002@example.com',
    password: 'Test@123456',
    nickname: '测试用户002',
    role: 'user'
  },
  admin: {
    id: 999,
    username: 'admin_user',
    email: 'admin@example.com',
    password: 'Admin@123456',
    nickname: '管理员',
    role: 'admin'
  },
  moderator: {
    id: 998,
    username: 'moderator_user',
    email: 'moderator@example.com',
    password: 'Moderator@123456',
    nickname: '版主',
    role: 'moderator'
  },
  inactiveUser: {
    id: 997,
    username: 'inactive_user',
    email: 'inactive@example.com',
    password: 'Test@123456',
    nickname: '未激活用户',
    role: 'user',
    openclawStatus: 'inactive'
  },
  suspendedUser: {
    id: 996,
    username: 'suspended_user',
    email: 'suspended@example.com',
    password: 'Test@123456',
    nickname: '已暂停用户',
    role: 'user',
    openclawStatus: 'suspended'
  },
  openclaw: {
    id: 995,
    username: 'openclaw_user',
    email: 'openclaw@example.com',
    password: 'Test@123456',
    nickname: 'OpenClaw用户',
    role: 'openclaw',
    apiKey: 'oc_aK_aB3dE5fG7hI9jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE'
  }
};

// 测试小说
export const testNovels = {
  novel1: {
    id: 1001,
    title: '斗破苍穹',
    author: '天蚕土豆',
    category: '玄幻',
    status: 'completed',
    isVip: false,
    description: '这里是斗气的世界，没有花俏艳丽的魔法，有的，仅仅是繁衍到巅峰的斗气！'
  },
  vipNovel: {
    id: 1002,
    title: 'VIP测试小说',
    author: '测试作者',
    category: '都市',
    status: 'ongoing',
    isVip: true,
    pricePerChapter: 0.5,
    description: '这是一本VIP测试小说'
  },
  novel3: {
    id: 1003,
    title: '普通测试小说',
    author: '测试作者',
    category: '科幻',
    status: 'ongoing',
    isVip: false,
    description: '这是一本普通测试小说'
  }
};

// 测试章节
export const testChapters = {
  chapter1: {
    id: 1001001,
    novelId: 1001,
    title: '第一章 陨落的天才',
    chapterNumber: 1,
    isVip: false,
    price: 0,
    content: '斗之力，三段！'
  },
  vipChapter: {
    id: 1002005,
    novelId: 1002,
    title: '第五章 VIP章节',
    chapterNumber: 5,
    isVip: true,
    price: 0.5,
    content: '这是VIP章节内容'
  }
};

// 测试评论
export const testComments = {
  comment1: {
    id: 1,
    novelId: 1001,
    chapterId: null,
    userId: 1,
    content: '这本小说太精彩了！',
    rating: 5,
    parentId: null
  },
  reply1: {
    id: 2,
    novelId: 1001,
    chapterId: null,
    userId: 2,
    content: '确实好看！',
    rating: 0,
    parentId: 1
  }
};

// 生成唯一用户数据
export function generateUniqueUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    username: `int_test_${timestamp}_${random}`,
    email: `int_test_${timestamp}_${random}@example.com`,
    password: 'Test@123456',
    nickname: `集成测试用户${random}`
  };
}

// 生成唯一小说数据
export function generateUniqueNovel() {
  const timestamp = Date.now();
  return {
    title: `集成测试小说${timestamp}`,
    author: '集成测试作者',
    category: '科幻',
    description: '这是集成测试生成的小说',
    status: 'ongoing',
    isVip: false
  };
}

// OpenClaw测试数据
export const openclawData = {
  title: '集成测试AI作品',
  prompt: '写一个关于未来世界的科幻故事',
  genre: '科幻',
  chapters: 10
};

// OpenClaw激活测试数据
export const openclawActivationData = {
  validAgentName: '星云创作者',
  validNamespace: 'scifi',
  validCreationType: 'novelist',
  validDescription: '这是一个测试用的OpenClaw激活申请',
  sensitiveNames: ['官方', '管理员', '系统', '客服', 'admin', 'system'],
  validApiKey: 'oc_aK_aB3dE5fG7hI9jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE',
  invalidApiKeys: [
    'usr_invalid_key',
    'oc_aK_short',
    'invalid_prefix_xxx',
    ''
  ]
};

// 书架测试数据
export const bookshelfData = {
  category: '测试分类',
  autoPurchase: false,
  notifyUpdate: true
};
