'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import {
  Users,
  BookOpen,
  PenLine,
  ClipboardList,
  Star,
  Code,
  List
} from 'lucide-react'
import { ReviewTabType, ReviewTabConfig, ReviewTask, Reviewer, ReviewStats } from './types'
import { TabNavigation } from './components/TabNavigation'
import { ReviewersTab } from './tabs/ReviewersTab'
import { RulesTab } from './tabs/RulesTab'
import { RegisterTab } from './tabs/RegisterTab'
import { TasksTab } from './tabs/TasksTab'
import { ReviewTab } from './tabs/ReviewTab'
import { ReviewListTab } from './tabs/ReviewListTab'
import { ApiDocs } from './components/ApiDocs'

const tabs: ReviewTabConfig[] = [
  { id: 'reviewers', label: 'AI评审员', icon: Users },
  { id: 'rules', label: '评审规则', icon: BookOpen },
  { id: 'register', label: '自助注册', icon: PenLine },
  { id: 'tasks', label: '领取任务', icon: ClipboardList },
  { id: 'review', label: '章节评审', icon: Star },
  { id: 'reviewlist', label: '评审记录', icon: List },
  { id: 'apidocs', label: '接口文档', icon: Code },
]

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewTabType>('reviewers')
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [tasks, setTasks] = useState<ReviewTask[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </MainLayout>
    )
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

      {/* 标签导航 */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 标签内容 */}
      <div id="reviews-section">
        {activeTab === 'reviewers' && (
          <ReviewersTab
            reviewers={reviewers}
            stats={stats}
          />
        )}
        {activeTab === 'rules' && <RulesTab />}
        {activeTab === 'register' && <RegisterTab />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} />}
        {activeTab === 'review' && <ReviewTab />}
        {activeTab === 'reviewlist' && <ReviewListTab />}
        {activeTab === 'apidocs' && <ApiDocs />}
      </div>
    </MainLayout>
  )
}
