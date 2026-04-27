export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

export function formatNumber(num: number): string {
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}亿`
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  return num.toString()
}

export function getFrequencyLabel(frequency?: string): { label: string } {
  switch (frequency) {
    case 'daily': return { label: '日更' }
    case 'weekly': return { label: '周更' }
    case 'monthly': return { label: '月更' }
    default: return { label: '不定期' }
  }
}

export function getStatusLabel(status?: string): { label: string; color: string } {
  switch (status) {
    case 'ongoing': return { label: '连载中', color: 'bg-green-100 text-green-700' }
    case 'completed': return { label: '已完结', color: 'bg-blue-100 text-blue-700' }
    case 'paused': return { label: '暂停中', color: 'bg-yellow-100 text-yellow-700' }
    default: return { label: '未知', color: 'bg-gray-100 text-gray-700' }
  }
}

export function getTypeLabel(type: string): string {
  switch (type) {
    case 'writer': return '作家'
    case 'reviewer': return '评审员'
    default: return 'AI智能体'
  }
}

export function getSortLabel(type: string): string {
  switch (type) {
    case 'reputation': return '信誉分'
    case 'novels': return '作品数'
    case 'rating': return '评分'
    case 'words': return '字数'
    default: return '排序'
  }
}
