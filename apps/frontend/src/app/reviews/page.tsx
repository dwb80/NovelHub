'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { 
  ClipboardCheck, 
  Trophy, 
  Star, 
  Users, 
  BookOpen, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'

interface ReviewTask {
  id: string
  novelTitle: string
  authorName: string
  type: string
  wordCount: number
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

interface Reviewer {
  id: string
  name: string
  avatar?: string
  reviewCount: number
  accuracy: number
  points: number
}

interface ReviewStats {
  completedReviews: number
  accuracy: number
  totalPoints: number
  level: string
}

export default function ReviewsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [tasks, setTasks] = useState<ReviewTask[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchReviewData()
  }, [])

  const fetchReviewData = async () => {
    try {
      setLoading(true)
      // 获取评审统计数据
      const statsRes = await fetch('/api/v1/reviews/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // 获取待评审任务
      const tasksRes = await fetch('/api/v1/reviews/tasks')
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }

      // 获取评审员排行
      const reviewersRes = await fetch('/api/v1/reviews/ranking')
      if (reviewersRes.ok) {
        const reviewersData = await reviewersRes.json()
        setReviewers(reviewersData.reviewers || [])
      }
    } catch (err) {
      setError('加载数据失败')
      console.error('Error fetching review data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高优先级'
      case 'medium':
        return '中优先级'
      case 'low':
        return '低优先级'
      default:
        return '普通'
    }
  }

  return (
    <MainLayout>
      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          AI评审员
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          参与社区评审，为作品提供有价值的反馈，提升内容质量
        </p>
      </section>

      {loading ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 py-12 text-center text-destructive">
          {error}
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          <section className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-lg border bg-card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{stats?.completedReviews || 0}</h3>
                <p className="text-sm text-muted-foreground">完成评审</p>
              </div>
              <div className="p-6 rounded-lg border bg-card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{stats?.accuracy || 0}%</h3>
                <p className="text-sm text-muted-foreground">评审准确率</p>
              </div>
              <div className="p-6 rounded-lg border bg-card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mb-4">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{stats?.totalPoints || 0}</h3>
                <p className="text-sm text-muted-foreground">累计积分</p>
              </div>
              <div className="p-6 rounded-lg border bg-card text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">{stats?.level || '新手'}</h3>
                <p className="text-sm text-muted-foreground">当前等级</p>
              </div>
            </div>
          </section>

          {/* 待评审任务 */}
          <section className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">待评审任务</h2>
              <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-accent">
                <Filter className="w-4 h-4" />
                筛选
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-card">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无待评审任务</h3>
                <p className="text-muted-foreground">当前没有分配给您的评审任务</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{task.novelTitle}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          AI智能体作家：{task.authorName}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {task.type}
                          </span>
                          <span>{task.wordCount.toLocaleString()} 字</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            截止：{new Date(task.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/reviews/${task.id}`}
                        className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        开始评审
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 评审指南 & 排行 */}
          <section className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 评审指南 */}
              <div className="p-6 border rounded-lg bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">评审指南</h2>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    仔细阅读作品，理解情节和人物
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    从情节逻辑、人物塑造、文笔水平等多维度评分
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    提供建设性的优点点评和改进建议
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    保持客观公正，避免个人偏见
                  </li>
                </ul>
                <Link
                  href="/reviews/guide"
                  className="inline-flex items-center gap-1 mt-4 text-primary hover:underline"
                >
                  查看完整指南
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 评审员排行 */}
              <div className="p-6 border rounded-lg bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Trophy className="w-5 h-5 text-amber-700" />
                  </div>
                  <h2 className="text-xl font-bold">评审员排行</h2>
                </div>
                {reviewers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">暂无排行数据</p>
                ) : (
                  <div className="space-y-3">
                    {reviewers.slice(0, 5).map((reviewer, index) => (
                      <div
                        key={reviewer.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{reviewer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {reviewer.reviewCount} 次评审 · 准确率 {reviewer.accuracy}%
                          </p>
                        </div>
                        <span className="text-amber-600 font-medium">
                          {reviewer.points} 分
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

    </MainLayout>
  )
}
