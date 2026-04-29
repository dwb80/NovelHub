'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Novel, Chapter } from '@/types'
import NovelHeader from './components/NovelHeader'
import ChapterList from './components/ChapterList'
import CommentSection from './components/CommentSection'
import RecommendationSidebar from './components/RecommendationSidebar'
import { Comment, ReadingProgress, RecommendedNovel } from './components/types'

function NovelDetailContent() {
  const params = useParams()
  const novelId = params.id as string
  
  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCollected, setIsCollected] = useState(false)
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters')
  const [commentSort, setCommentSort] = useState<'newest' | 'hottest'>('newest')
  const [chapterOrder, setChapterOrder] = useState<'asc' | 'desc'>('asc')
  const [recommendations, setRecommendations] = useState<RecommendedNovel[]>([])
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null)

  useEffect(() => {
    if (novelId) {
      fetchNovelDetail()
      fetchChapters()
      fetchComments()
      checkCollectionStatus()
      fetchRecommendations()
      fetchReadingProgress()
    }
  }, [novelId])

  const fetchNovelDetail = async () => {
    try {
    setLoading(true)
      const response = await fetch(`/api/v1/novels/${novelId}`)
      if (!response.ok) throw new Error('获取小说详情失败')
      const data = await response.json()
      setNovel(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/v1/novels/${novelId}/chapters`)
      if (!response.ok) throw new Error('获取章节列表失败')
      const data = await response.json()
      setChapters(data.items || [])
    } catch (err) {
      console.error('获取章节列表失败:', err)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/v1/novels/${novelId}/comments?sort=${commentSort}`)
      if (!response.ok) throw new Error('获取评论失败')
      const data = await response.json()
      setComments(data.items || [])
    } catch (err) {
      console.error('获取评论失败:', err)
    }
  }

  const checkCollectionStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await fetch(`/api/v1/bookshelf/check?novelId=${novelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setIsCollected(data.isCollected)
      }
    } catch (err) {
      console.error('检查收藏状态失败:', err)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/v1/novels/${novelId}/recommendations`)
      if (!response.ok) throw new Error('获取推荐失败')
      const data = await response.json()
      setRecommendations(data.items || [])
    } catch (err) {
      console.error('获取推荐失败:', err)
    }
  }

  const fetchReadingProgress = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const response = await fetch(`/api/v1/novels/${novelId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setReadingProgress(data)
      }
    } catch (err) {
      console.error('获取阅读进度失败:', err)
    }
  }

  const toggleCollection = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }
      const method = isCollected ? 'DELETE' : 'POST'
      const response = await fetch('/api/v1/bookshelf', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ novelId })
      })
      if (response.ok) {
        setIsCollected(!isCollected)
      }
    } catch (err) {
      console.error('收藏操作失败:', err)
    }
  }

  const submitComment = async (content: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }
      const response = await fetch(`/api/v1/novels/${novelId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })
      if (response.ok) {
        fetchComments()
      }
    } catch (err) {
      console.error('发表评论失败:', err)
    }
  }

  const submitReply = async (parentId: string, content: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }
      const response = await fetch(`/api/v1/novels/${novelId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, parentId })
      })
      if (response.ok) {
        fetchComments()
      }
    } catch (err) {
      console.error('回复评论失败:', err)
    }
  }

  const likeComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        return
      }
      const response = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        fetchComments()
      }
    } catch (err) {
      console.error('点赞失败:', err)
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
        {/* 小说头部信息 */}
        <NovelHeader
          novel={novel}
          chapters={chapters}
          readingProgress={readingProgress}
          isCollected={isCollected}
          onToggleCollection={toggleCollection}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2">
            {/* 标签切换 */}
            <div className="flex items-center justify-between border-b mb-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'chapters' 
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
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'comments' 
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
            </div>

            {/* 内容区域 */}
            {activeTab === 'chapters' ? (
              <ChapterList
                novelId={novelId}
                chapters={chapters}
                chapterOrder={chapterOrder}
                onToggleOrder={() => setChapterOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              />
            ) : (
              <CommentSection
                novelId={novelId}
                comments={comments}
                commentSort={commentSort}
                onChangeSort={setCommentSort}
                onSubmitComment={submitComment}
                onSubmitReply={submitReply}
                onLikeComment={likeComment}
  />
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            <RecommendationSidebar recommendations={recommendations} />
          </div>
        </div>
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
