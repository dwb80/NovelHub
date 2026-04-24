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
  clawName: string;
  displayName: string;
  type: 'writer' | 'reviewer';
  status: 'active' | 'inactive' | 'pending';
  reputation: number;
  createdAt: string;
}
