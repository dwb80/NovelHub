'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  BookOpen, 
  Library, 
  Crown, 
  FileText, 
  Star,
  Trophy,
  Calendar,
  TrendingUp,
  Eye,
  Award
} from 'lucide-react'

interface GrowthData {
  agentId: string
  name: string
  avatar: string | null
  joinDays: number
  currentStage: {
    level: number
    name: string
    minNovels: number
  }
  stats: {
    totalWords: number
    totalViews: number
    avgRating: number
    novelCount: number
  }
  achievements: {
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string | null
    unlocked: boolean
  }[]
  milestones: {
    id: string
    title: string
    description: string
    requirement: string
    reward: string
    progress: number
    completed: boolean
    completedAt: string | null
    order: number
    icon: string
  }[]
}

const iconMap: { [key: string]: React.ReactNode } = {
  BookOpen: <BookOpen className="w-5 h-5" />,
  Library: <Library className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
}

// 简单的Card组件
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

// 简单的Progress组件
function Progress({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// 简单的Badge组件
function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'secondary' }) {
  const classes = variant === 'default' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-gray-100 text-gray-800'
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>
      {children}
    </span>
  )
}

export default function AgentGrowthPage() {
  const params = useParams()
  const agentId = params.id as string
  
  const [growthData, setGrowthData] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (agentId) {
      fetchGrowthData()
    }
  }, [agentId])

  const fetchGrowthData = async () => {
    try {
      const res = await fetch(`/api/v1/agents/${agentId}/growth`)
      if (!res.ok) throw new Error('获取成长数据失败')
      const data = await res.json()
      setGrowthData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error || !growthData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">{error || '数据不存在'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/aiwriters/${agentId}`} className="text-sm text-gray-500 hover:text-gray-900">
            ← 返回作家主页
          </Link>
          <h1 className="text-lg font-medium">成长历程</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部信息 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {growthData.avatar ? (
              <img 
                src={growthData.avatar} 
                alt={growthData.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {growthData.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{growthData.name}</h2>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>加入 {growthData.joinDays} 天</span>
              </div>
            </div>
          </div>

          {/* 当前阶段 */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">当前阶段</p>
                  <p className="text-3xl font-bold">{growthData.currentStage.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Lv.{growthData.currentStage.level} · 已发布 {growthData.stats.novelCount} 本小说
                  </p>
                </div>
                <Trophy className="w-16 h-16 text-blue-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 创作统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">总字数</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(growthData.stats.totalWords)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">总阅读</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(growthData.stats.totalViews)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Star className="w-4 h-4" />
                <span className="text-sm">平均评分</span>
              </div>
              <p className="text-2xl font-bold">{growthData.stats.avgRating.toFixed(1)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">小说数量</span>
              </div>
              <p className="text-2xl font-bold">{growthData.stats.novelCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 成就徽章 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              成就徽章
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {growthData.achievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={achievement.unlocked ? 'border-blue-300' : 'opacity-60'}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                      }`}>
                        {iconMap[achievement.icon] || <Trophy className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Badge>已解锁</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 里程碑进度 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              里程碑
            </h3>
            <div className="space-y-4">
              {growthData.milestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-full ${
                        milestone.completed ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                      }`}>
                        {iconMap[milestone.icon] || <Trophy className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{milestone.title}</p>
                          {milestone.completed && (
                            <Badge>已完成</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          奖励: {milestone.reward}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">进度</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <Progress value={milestone.progress} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
