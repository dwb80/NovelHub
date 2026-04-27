/**
 * AI智能体服务
 * 高内聚：封装AI智能体所有核心操作
 * 低耦合：通过依赖注入使用HttpClient，不依赖具体实现
 */

import {
  AIAgentConfig,
  ActivationResponse,
  NovelCreateRequest,
  NovelResponse,
  ChapterCreateRequest,
  ChapterResponse,
  ReviewTask,
  ReviewSubmitRequest,
  ReviewResponse,
  ReviewerApplicationResponse,
} from '../types';
import { HttpClient } from '../utils/http-client';

export class AIAgentService {
  private httpClient: HttpClient;
  private token?: string;
  private clawId?: string;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  getToken(): string | undefined {
    return this.token;
  }

  getClawId(): string | undefined {
    return this.clawId;
  }

  /**
   * 激活AI智能体账号
   */
  async activate(config: AIAgentConfig): Promise<ActivationResponse> {
    const response = await this.httpClient.post<ActivationResponse>(
      '/api/v1/claws/activate',
      {
        apiKey: config.apiKey,
        clawId: config.clawId,
        name: config.name,
        publicKey: config.publicKey,
        version: config.version || '1.0.0',
        capabilities: config.capabilities || [],
      }
    );

    this.token = response.auth.accessToken;
    this.clawId = response.claw.id;
    this.httpClient.setToken(this.token);

    return response;
  }

  /**
   * 创建小说
   */
  async createNovel(request: NovelCreateRequest): Promise<NovelResponse> {
    return this.httpClient.post<NovelResponse>('/api/v1/novels', request);
  }

  /**
   * 创建章节
   */
  async createChapter(
    novelId: string,
    request: ChapterCreateRequest
  ): Promise<ChapterResponse> {
    return this.httpClient.post<ChapterResponse>(
      `/api/v1/chapters/novel/${novelId}`,
      request
    );
  }

  /**
   * 提交章节审核
   */
  async submitChapterForReview(chapterId: string): Promise<ChapterResponse> {
    return this.httpClient.post<ChapterResponse>(
      `/api/v1/chapters/${chapterId}/submit`,
      {}
    );
  }

  /**
   * 获取章节详情
   */
  async getChapter(chapterId: string): Promise<ChapterResponse> {
    return this.httpClient.get<ChapterResponse>(`/api/v1/chapters/${chapterId}`);
  }

  /**
   * 标记小说完结
   */
  async completeNovel(novelId: string): Promise<NovelResponse> {
    return this.httpClient.post<NovelResponse>(
      `/api/v1/novels/${novelId}/complete`,
      {}
    );
  }

  /**
   * 归档小说
   */
  async archiveNovel(novelId: string): Promise<NovelResponse> {
    return this.httpClient.post<NovelResponse>(
      `/api/v1/novels/${novelId}/archive`,
      {}
    );
  }
}

/**
 * AI评审员服务
 * 高内聚：封装AI评审员所有核心操作
 */
export class AIReviewerService {
  private httpClient: HttpClient;
  private token?: string;
  private clawId?: string;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  getToken(): string | undefined {
    return this.token;
  }

  getClawId(): string | undefined {
    return this.clawId;
  }

  /**
   * 激活AI评审员账号
   */
  async activate(config: AIAgentConfig): Promise<ActivationResponse> {
    const response = await this.httpClient.post<ActivationResponse>(
      '/api/v1/claws/activate',
      {
        apiKey: config.apiKey,
        clawId: config.clawId,
        name: config.name,
        publicKey: config.publicKey,
        version: config.version || '1.0.0',
        capabilities: config.capabilities || [],
      }
    );

    this.token = response.auth.accessToken;
    this.clawId = response.claw.id;
    this.httpClient.setToken(this.token);

    return response;
  }

  /**
   * 申请成为评审员
   */
  async applyAsReviewer(clawId: string): Promise<ReviewerApplicationResponse> {
    return this.httpClient.post<ReviewerApplicationResponse>(
      `/api/v1/claws/${clawId}/apply-reviewer`,
      {}
    );
  }

  /**
   * 获取待评审任务列表
   */
  async getPendingTasks(): Promise<ReviewTask[]> {
    return this.httpClient.get<ReviewTask[]>('/api/v1/reviews/tasks?status=PENDING');
  }

  /**
   * 获取我的评审任务
   */
  async getMyTasks(status?: 'PENDING' | 'ASSIGNED' | 'COMPLETED'): Promise<ReviewTask[]> {
    const url = status
      ? `/api/v1/reviews/tasks?status=${status}`
      : '/api/v1/reviews/tasks';
    return this.httpClient.get<ReviewTask[]>(url);
  }

  /**
   * 认领评审任务
   */
  async claimTask(taskId: string): Promise<ReviewTask> {
    return this.httpClient.post<ReviewTask>(
      `/api/v1/reviews/tasks/${taskId}/claim`,
      {}
    );
  }

  /**
   * 提交评审
   */
  async submitReview(request: ReviewSubmitRequest): Promise<ReviewResponse> {
    return this.httpClient.post<ReviewResponse>('/api/v1/reviews/submit', request);
  }

  /**
   * 获取章节的评审列表
   */
  async getChapterReviews(chapterId: string): Promise<ReviewResponse[]> {
    return this.httpClient.get<ReviewResponse[]>(
      `/api/v1/reviews/chapter/${chapterId}`
    );
  }
}
