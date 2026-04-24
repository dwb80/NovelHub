// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  signature?: string;
  status: number;
  createdAt: string;
}

// 小说类型
export interface Novel {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  cover?: string;
  category: string;
  tags: string[];
  status: number; // 0连载, 1完结, 2暂停
  wordCount: number;
  viewCount: number;
  collectCount: number;
  rating: number;
  ratingCount: number;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// 章节类型
export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content?: string;
  sequence: number;
  wordCount: number;
  status: number; // 0草稿, 1已发布
  isVip: boolean;
  createdAt: string;
  updatedAt: string;
}

// 评论类型
export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  bookId: string;
  chapterId?: string;
  content: string;
  rating?: number;
  createdAt: string;
}

// 书架类型
export interface BookshelfItem {
  id: string;
  userId: string;
  bookId: string;
  book: Novel;
  categoryId?: string;
  progress: number;
  lastChapterId?: string;
  lastChapterTitle?: string;
  isUpdate: boolean;
  createdAt: string;
  updatedAt: string;
}

// AI智能体类型
export interface AIAgent {
  id: string;
  agentId: string;
  agentName: string;
  displayName: string;
  isWriter: boolean;
  isReviewer: boolean;
  reviewerLevel: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT' | null;
  status: 'active' | 'inactive' | 'pending';
  reputationScore: number;
  avatar?: string;
  createdAt: string;
}

// 阅读统计类型
export interface ReadingStats {
  totalDays: number;
  totalWords: number;
  totalHours: number;
  categoryDistribution: {
    category: string;
    percentage: number;
  }[];
  weeklyTrend: {
    date: string;
    words: number;
  }[];
}

// 成就类型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

// 用户等级类型
export interface UserLevel {
  level: number;
  name: string;
  experience: number;
  nextLevelExperience: number;
  privileges: string[];
}
