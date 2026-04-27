export enum NovelStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

export enum NovelSortType {
  HOT = 'hot',
  NEW = 'new',
  RATING = 'rating',
  UPDATED = 'updated',
}

export enum ChapterStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
}

export enum CommentSortType {
  NEWEST = 'newest',
  HOTTEST = 'hottest',
}

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  CHAPTER_LIMIT: 50,
} as const;

export const NOVEL_CONSTANTS = {
  MAX_BOOKSHELF_SIZE: 500,
  MIN_TITLE_LENGTH: 2,
  MAX_TITLE_LENGTH: 30,
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

export const COMMENT_CONSTANTS = {
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 500,
} as const;

export const VALIDATION_RULES = {
  NOVEL_TITLE_MIN: 2,
  NOVEL_TITLE_MAX: 100,
  CHAPTER_CONTENT_MIN: 100,
  COMMENT_MIN: 10,
  COMMENT_MAX: 500,
} as const;

/**
 * 发现页分类体系 - 男频/女频/出版
 */
export const CategoryGroups = {
  MALE: ['xuanhuan', 'dushi', 'xianxia', 'kehuan', 'lishi', 'wuxia', 'junshi', 'youxi'],
  FEMALE: ['yanqing', 'guyan', 'xianyan', 'xuanyi', 'chuanyue', 'gongdou', 'zhichang', 'qingchun'],
  PUBLISHED: ['classic', 'literature', 'history', 'philosophy', 'biography'],
} as const;

/**
 * 排行榜类型
 */
export enum RankingType {
  HOT = 'hot',
  FAVORITE = 'favorite',
  RATING = 'rating',
  NEW = 'new',
  COMPLETED = 'completed',
}

/**
 * 排行榜时间范围
 */
export enum RankingPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL = 'all',
}

/**
 * 书架排序类型
 */
export enum BookshelfSortType {
  RECENT = 'recent',
  ADDED = 'added',
  PROGRESS = 'progress',
}

/**
 * 书架阅读状态
 */
export enum BookshelfStatus {
  READING = 'READING',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  WISHLIST = 'WISHLIST',
  WANT_TO_READ = 'WANT_TO_READ',
}
