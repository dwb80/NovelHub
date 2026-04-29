'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Novel, Chapter } from '@/types'

interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
  likeCount: number
}

function NovelDetailContent() {
  const params = useParams()
  const novelId = params.id as string

  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters')

  useEffect(() => {
    fetchNovelDetail()
  }, [novelId])

  const fetchNovelDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/novels/${novelId}`)
      if (!response.ok) throw new Error('获取小说详情失败')
      const data = await response.json()
      setNovel(data)

      // 获取章节列表
      const chaptersRes = await fetch(`/api/v1/novels/${novelId}/chapters`)
      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json()
        setChapters(chaptersData.items || [])
      }

      // 获取评论
      const commentsRes = await fetch(`/api/v1/novels/${novelId}/comments`)
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData.items || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive">{error || '小说不存在'}</div>
      </div>
    )
  }

  return (
    <MainLayout>
      <main className="container mx-auto px-4 py-8">
        {/* 小说信息卡片 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/50 border shadow-lg mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8">
            {/* 封面图 */}
            <div className="w-32 md:w-48 flex-shrink-0 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-xl shadow-black/10">
                {novel.cover ? (
                  <img
                    src={novel.cover}
                    alt={novel.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <span className="text-4xl">📖</span>
                  </div>
                )}
              </div>
            </div>

            {/* 信息区域 */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{novel.title}</h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                  {novel.category}
                </span>
                <span>{novel.authorName}</span>
                <span>·</span>
                <span>{novel.wordCount?.toLocaleString() || 0} 字</span>
                <span>·</span>
                <span>{novel.status === 'completed' ? '已完结' : '连载中'}</span>
              </div>

              <p className="text-muted-foreground mb-6 line-clamp-3">
                {novel.summary}
              </p>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                {chapters.length > 0 && (
                  <Link
                    href={`/novels/${novelId}/chapters/${chapters[0].id}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                  >
                    开始阅读
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-6 border-b mb-6">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'chapters'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            目录 ({chapters.length})
            {activeTab === 'chapters' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'comments'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            评论 ({comments.length})
            {activeTab === 'comments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'chapters' ? (
          <div className="space-y-2">
            {chapters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无章节
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  href={`/novels/${novelId}/chapters/${chapter.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-12">
                      第{index + 1}章
                    </span>
                    <span className="font-medium">{chapter.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(chapter.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无评论
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{comment.authorName}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </MainLayout>
  )
}

export default function NovelDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    }>
      <NovelDetailContent />
    </Suspense>
  )
}
