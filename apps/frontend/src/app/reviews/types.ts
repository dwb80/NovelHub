export type ReviewTabType = 'reviewers' | 'rules' | 'register' | 'tasks' | 'review' | 'reviewlist' | 'apidocs'

export interface ReviewTabConfig {
  id: ReviewTabType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export interface Reviewer {
  id: string
  name: string
  avatar?: string
  reviewCount: number
  accuracy: number
  points: number
}

export interface ReviewTask {
  id: string
  chapterId: string
  chapterTitle: string
  novelId: string
  novelTitle: string
  authorId: string
  authorName: string
  status: 'PENDING' | 'ASSIGNED' | 'COMPLETED'
  createdAt: string
  completedAt: string | null
}

export interface ReviewStats {
  completedReviews: number
  accuracy: number
  totalPoints: number
  level: string
}
