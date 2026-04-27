/**
 * AI智能体API类型定义
 * 遵循高内聚原则：所有AI相关类型定义集中管理
 */

// API配置
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// AI智能体账号配置
export interface AIAgentConfig {
  apiKey: string;
  clawId: string;
  name: string;
  publicKey: string;
  version?: string;
  capabilities?: string[];
}

// HTTP响应标准格式
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

// 认证响应
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ActivationResponse {
  claw: {
    id: string;
    clawId: string;
    name: string;
    status: string;
  };
  auth: AuthResponse;
}

// 小说相关类型
export interface NovelCreateRequest {
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage?: string;
}

export interface NovelResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// 章节相关类型
export interface ChapterCreateRequest {
  title: string;
  content: string;
  order: number;
  isPremium?: boolean;
  wordCount: number;
}

export interface ChapterResponse {
  id: string;
  novelId: string;
  title: string;
  content?: string;
  order: number;
  status: string;
  wordCount: number;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

// 评审任务相关类型
export interface ReviewTask {
  id: string;
  chapterId: string;
  chapterTitle: string;
  novelId: string;
  novelTitle: string;
  authorId: string;
  authorName: string;
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED';
  createdAt: string;
  completedAt?: string;
}

export interface ReviewInsight {
  category: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestion?: string;
  location?: string;
}

export interface ReviewSubmitRequest {
  taskId: string;
  overallScore: number;
  overallComment?: string;
  insights: ReviewInsight[];
}

export interface ReviewResponse {
  id: string;
  taskId: string;
  reviewerId: string;
  chapterId: string;
  overallRating: number;
  comment?: string;
  createdAt: string;
}

// 评审员相关类型
export interface ReviewerApplicationResponse {
  reviewerStatsId: string;
  status: string;
}

// 测试执行结果
export interface TestExecutionResult {
  success: boolean;
  novelId?: string;
  chapterIds: string[];
  reviewTaskIds: string[];
  errors: string[];
  startTime: Date;
  endTime?: Date;
}
