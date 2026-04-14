/**
 * E2E测试数据管理
 * 提供测试所需的各类测试数据
 */

export interface TestUser {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface TestNovel {
  id: number;
  title: string;
  author: string;
  category: string;
  isVip: boolean;
  pricePerChapter?: number;
}

export interface TestComment {
  content: string;
  rating: number;
  reply?: string;
}

/**
 * 测试用户数据
 */
export const testUsers: Record<string, TestUser> = {
  user1: {
    username: 'test_user_001',
    email: 'test_user_001@example.com',
    password: 'Test@123456',
    nickname: '测试用户001'
  },
  user2: {
    username: 'test_user_002',
    email: 'test_user_002@example.com',
    password: 'Test@123456',
    nickname: '测试用户002'
  },
  newUser: {
    username: `new_user_${Date.now()}`,
    email: `new_user_${Date.now()}@example.com`,
    password: 'Test@123456',
    nickname: '新测试用户'
  }
};

/**
 * 测试小说数据
 */
export const testNovels: Record<string, TestNovel> = {
  novel1: {
    id: 1001,
    title: '斗破苍穹',
    author: '天蚕土豆',
    category: '玄幻',
    isVip: false
  },
  vipNovel: {
    id: 1002,
    title: 'VIP测试小说',
    author: '测试作者',
    category: '都市',
    isVip: true,
    pricePerChapter: 0.5
  },
  novel3: {
    id: 1003,
    title: '普通测试小说',
    author: '测试作者',
    category: '科幻',
    isVip: false
  }
};

/**
 * 测试评论数据
 */
export const testComments: Record<string, TestComment> = {
  comment1: {
    content: '这本小说太精彩了！强烈推荐！',
    rating: 5,
    reply: '确实好看，已经追更到最新章了'
  },
  comment2: {
    content: '剧情紧凑，人物刻画生动',
    rating: 4
  }
};

/**
 * 测试搜索关键词
 */
export const searchKeywords = {
  valid: ['斗破苍穹', '玄幻', '天蚕土豆'],
  invalid: ['xyzabc123', '不存在的书'],
  partial: ['斗破', '苍穹']
};

/**
 * 阅读器设置测试数据
 */
export const readerSettings = {
  fontSizes: [14, 16, 18, 20, 22, 24],
  themes: ['theme-light', 'theme-dark', 'theme-eye-care', 'theme-paper'],
  lineHeights: [1.5, 1.8, 2.0, 2.5]
};

/**
 * OpenClaw测试数据
 */
export const openclawData = {
  title: '测试作品E2E',
  prompt: '写一个关于未来世界的科幻故事',
  genre: '科幻',
  chapters: 10,
  outline: {
    title: '星际穿越',
    summary: '人类在2099年发现了一种可以穿越时空的技术...',
    chapters: [
      { title: '第一章：发现', summary: '科学家发现了时空裂缝' },
      { title: '第二章：准备', summary: '组建探险队准备穿越' }
    ]
  }
};

/**
 * 生成唯一测试数据（避免冲突）
 */
export function generateUniqueUser(): TestUser {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return {
    username: `test_${timestamp}_${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'Test@123456',
    nickname: `测试用户${random}`
  };
}

/**
 * 生成唯一小说标题
 */
export function generateUniqueNovelTitle(): string {
  const timestamp = Date.now();
  return `测试小说${timestamp}`;
}

/**
 * 书架分类测试数据
 */
export const bookshelfCategories = {
  default: '默认分类',
  fantasy: '玄幻 favorites',
  scifi: '科幻收藏',
  romance: '言情小说'
};
