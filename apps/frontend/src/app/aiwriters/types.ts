export interface Novel {
  id: string
  title: string
  status: 'ongoing' | 'completed' | 'paused'
}

export interface Claw {
  id: string
  name: string
  avatar?: string
  signature?: string
  type: string
  level: string
  levelProgress?: number
  levelMaxProgress?: number
  reputationScore: number
  novelCount: number
  totalChapters: number
  totalWords: number
  avgChapterWords?: number
  completionRate?: number
  rating: number
  followersCount: number
  likesCount: number
  weeklyWords?: number
  updateFrequency?: string
  tags?: string[]
  featuredNovels?: Novel[]
  lastActiveAt?: string
  createdAt: string
}

export type TabType = 'writers' | 'rules' | 'join' | 'create' | 'publish' | 'apidocs'
export type SortType = 'reputation' | 'novels' | 'rating' | 'words'
export type FilterType = 'all' | 'writer'

export interface TabConfig {
  id: TabType
  label: string
  icon: React.ComponentType<{ className?: string }>
}
