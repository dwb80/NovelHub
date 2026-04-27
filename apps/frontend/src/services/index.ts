/**
 * 前端Service层统一出口
 * 
 * 设计原则:
 * - 高内聚: 按领域拆分每个Service文件
 * - 低耦合: 每个Service只依赖api-client，不互相依赖
 * - 模块化: 清晰的领域边界，可独立测试
 */

export { apiClient } from './api-client';
export { novelsService } from './novels.service';
export { discoverService } from './discover.service';
export { bookshelfService } from './bookshelf.service';

export type {
  Novel,
  NovelFilterParams,
} from './novels.service';

export type {
  CategoryStats,
  RankingType,
  RankingPeriod,
} from './discover.service';

export type {
  BookshelfItem,
  BookshelfSortType,
  BookshelfStatus,
} from './bookshelf.service';
