/**
 * 通用响应映射工具
 * 统一处理DTO转换逻辑，消除各Service中的重复代码
 */

interface NovelAuthor {
  id: string;
  displayName?: string;
  name?: string;
  reputationScore?: number;
}

interface NovelBase {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  category?: string;
  status?: string;
  wordCount?: number;
  rating?: number;
  viewCount?: number;
  favoriteCount?: number;
  chapterCount?: number;
  author?: NovelAuthor;
  createdAt?: Date;
  updatedAt?: Date;
  lastChapterUpdatedAt?: Date;
  tags?: string[];
}

interface ChapterBase {
  id: string;
  title: string;
  orderIndex: number;
  wordCount?: number;
  status?: string;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentBase {
  id: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  replies?: CommentBase[];
}

/**
 * 映射小说实体到响应DTO
 */
export function mapNovelToResponse<T extends NovelBase>(novel: T) {
  return {
    id: novel.id,
    title: novel.title,
    description: novel.description,
    cover: novel.cover,
    category: novel.category,
    status: novel.status,
    wordCount: novel.wordCount || 0,
    rating: novel.rating || 0,
    viewCount: novel.viewCount || 0,
    favoriteCount: novel.favoriteCount || 0,
    chapterCount: novel.chapterCount || 0,
    author: novel.author ? {
      id: novel.author.id,
      name: novel.author.displayName || novel.author.name,
      reputationScore: novel.author.reputationScore,
    } : undefined,
    createdAt: novel.createdAt,
    updatedAt: novel.updatedAt,
    lastChapterUpdatedAt: (novel as any).lastChapterUpdatedAt,
    tags: novel.tags || [],
  };
}

/**
 * 映射章节实体到响应DTO
 */
export function mapChapterToResponse<T extends ChapterBase>(chapter: T) {
  return {
    id: chapter.id,
    title: chapter.title,
    order: chapter.orderIndex,
    orderIndex: chapter.orderIndex,
    wordCount: chapter.wordCount || 0,
    status: chapter.status,
    content: chapter.content,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
  };
}

/**
 * 映射评论实体到响应DTO
 */
export function mapCommentToResponse<T extends CommentBase>(comment: T): any {
  return {
    id: comment.id,
    content: comment.content,
    likeCount: comment.likeCount || 0,
    createdAt: comment.createdAt,
    replies: comment.replies?.map(r => mapCommentToResponse(r)) || [],
  };
}
