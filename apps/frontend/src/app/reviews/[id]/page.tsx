'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import {
  ArrowLeft,
  Star,
  Send,
  Save,
  BookOpen,
  Clock,
  User,
  AlertCircle
} from 'lucide-react'

interface ReviewTask {
  id: string
  novelTitle: string
  authorName: string
  type: string
  wordCount: number
  deadline: string
  summary: string
}

// 与后端 SubmitReviewDto 匹配的表单结构
interface ReviewForm {
  taskId: string
  overallScore: number
  plotRating?: number
  characterRating?: number
  pacingRating?: number
  styleRating?: number
  overallComment?: string
  insights: {
    category: 'PLOT' | 'CHARACTER' | 'PACING' | 'STYLE' | 'OTHER'
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
    title: string
    description: string
    suggestion?: string
  }[]
}

export default function ReviewDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const [task, setTask] = useState<ReviewTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<ReviewForm>({
    taskId: taskId,
    overallScore: 0,
    plotRating: 0,
    characterRating: 0,
    pacingRating: 0,
    styleRating: 0,
    overallComment: '',
    insights: []
  })

  useEffect(() => {
    fetchTaskDetail()
  }, [taskId])

  const fetchTaskDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/v1/reviews/tasks/${taskId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const data = await response.json()
        setTask(data)
        // 如果有草稿，加载草稿
        if (data.draft) {
          try {
            const draftData = JSON.parse(data.draft)
            setForm(prev => ({ ...prev, ...draftData }))
          } catch (e) {
            console.error('解析草稿失败:', e)
          }
        }
      } else {
        setError('获取任务详情失败')
      }
    } catch (err) {
      setError('获取任务详情失败')
      console.error('Error fetching task:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (field: keyof ReviewForm, value: number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleTextChange = (field: keyof ReviewForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/v1/reviews/tasks/${taskId}/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        alert('草稿已保存')
      } else {
        alert('保存草稿失败')
      }
    } catch (err) {
      alert('保存草稿失败')
      console.error('Error saving draft:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    // 验证表单
    if (form.plotRating === 0 || form.characterRating === 0 ||
      form.pacingRating === 0 || form.styleRating === 0 ||
      form.overallScore === 0) {
      alert('请完成所有维度的评分')
      return
    }

    if (!form.overallComment || form.overallComment.length < 10) {
      alert('总体评语至少需要10字')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/v1/reviews/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        alert('评审提交成功！')
        router.push('/reviews')
      } else {
        alert('提交评审失败')
      }
    } catch (err) {
      alert('提交评审失败')
      console.error('Error submitting review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const renderScoreInput = (label: string, field: keyof ReviewForm, description: string) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium">{label}</label>
        <span className="text-2xl font-bold text-primary">{(form[field] as number) || '-'}/10</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            onClick={() => handleScoreChange(field, score)}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${(form[field] as number) === score
                ? 'bg-primary text-primary-foreground'
                : 'border bg-background hover:bg-accent'
              }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error || '任务不存在'}</p>
          <Link href="/reviews" className="text-primary hover:underline mt-4 inline-block">
            返回评审系统
          </Link>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      {/* 顶部操作栏 */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reviews" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Link>
            <span className="font-semibold">评审任务</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存草稿'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? '提交中...' : '提交评审'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：作品信息 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 border rounded-lg bg-card">
                <h1 className="text-2xl font-bold mb-4">{task.novelTitle}</h1>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>作者：{task.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>类型：{task.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium">{task.wordCount?.toLocaleString() || 0}</span>
                    <span>字</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>截止：{task.deadline ? new Date(task.deadline).toLocaleDateString() : '无'}</span>
                  </div>
                </div>
              </div>

              {/* 评审指南 */}
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  评审指南
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 情节逻辑性：故事是否合理连贯</li>
                  <li>• 人物塑造：角色是否立体生动</li>
                  <li>• 节奏把控：故事节奏是否恰当</li>
                  <li>• 文风水平：语言表达是否流畅</li>
                  <li>• 总体评价：综合评分</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 右侧：评审表单 */}
          <div className="lg:col-span-2">
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-xl font-bold mb-6">评审表单</h2>

              {/* 评分维度 */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  多维度评分
                </h3>
                {renderScoreInput('情节逻辑性', 'plotRating', '故事结构是否合理，情节发展是否连贯')}
                {renderScoreInput('人物塑造', 'characterRating', '角色性格是否鲜明，人物关系是否清晰')}
                {renderScoreInput('节奏把控', 'pacingRating', '故事节奏是否恰当，张弛有度')}
                {renderScoreInput('文风水平', 'styleRating', '语言表达是否流畅，描写是否生动')}
                {renderScoreInput('总体评价', 'overallScore', '综合整体印象给出评分')}
              </div>

              {/* 文字评价 */}
              <div className="space-y-6">
                <div>
                  <label className="block font-medium mb-2">
                    总体评语 <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={form.overallComment || ''}
                    onChange={(e) => handleTextChange('overallComment', e.target.value)}
                    placeholder="请对作品进行总体评价，至少10字..."
                    rows={6}
                    className="w-full px-4 py-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {(form.overallComment || '').length} 字
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
