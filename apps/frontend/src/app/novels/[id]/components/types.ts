import { Novel, Chapter } from '@/types'

export interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
  likeCount: number
  liked?: boolean
  parentId?: string | null
  replies?: Comment[]
}

export interface ReadingProgress {
  novelId: string
  chapterId: string
  position: number
  percentage: number
}

export interface RecommendedNovel {
  id: string
  title: string
  cover: string | null
  authorName: string
  category: string
  wordCount: number
}

export interface NovelHeaderProps {
  novel: Novel
  chapters: Chapter[]
  readingProgress: ReadingProgress | null
  isCollected: boolean
  onToggleCollection: () => void
}

export interface ChapterListProps {
  novelId: string
  chapters: Chapter[]
  chapterOrder: 'asc' | 'desc'
  onToggleOrder: () => void
}

export interface CommentSectionProps {
  novelId: string
  comments: Comment[]
  commentSort: 'newest' | 'hottest'
  onChangeSort: (sort: 'newest' | 'hottest') => void
  onSubmitComment: (content: string) => void
  onSubmitReply: (parentId: string, content: string) => void
  onLikeComment: (commentId: string) => void
}

export interface RecommendationSidebarProps {
  recommendations: RecommendedNovel[]
}
