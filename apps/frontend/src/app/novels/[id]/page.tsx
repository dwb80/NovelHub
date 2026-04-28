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
  liked?: boolean
  parentId?: string | null
  replies?: Comment[]
}

interface ReadingProgress {
  novelId: string
  chapterId: string
  position: number
  percentage: number
}

interface RecommendedNovel {
  id: string
  title: string
  cover: string | null
  authorName: string
  category: string
  wordCount: number
}

function NovelDetailContent() {
  const params = useParams()
  const novelId = params.id as string
  
  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCollected, setIsCollected] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters')
  const [commentSort, setCommentSort] = useState<'newest' | 'hottest'>('newest')
  const [chapterOrder, setChapterOrder] = useState<'asc' | 'desc'>('asc')
  const [recommendations, setRecommendations] = useState<RecommendedNovel[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    if (novelId) {
      fetchNovelDetail()
      fetchChapters()
      fetchComments()
      checkCollectionStatus()
      fetchRecommendations()
    }
  }, [novelId, commentSort, chapterOrder])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/v1/novels/${novelId}/recommendations`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (err) {
      console.error('获取推荐失败:', err)
    }
  }

  const fetchNovelDetail = async () => {
    try {
      const response = await fetch(`/api/v1/novels/${novelId}`)
      if (!response.ok) {
        throw new Error('获取小说详情失败')
      }
      const data = await response.json()
      setNovel(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说详情失败')
    }
  }

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/v1/novels/${novelId}/chapters?order=${chapterOrder}`)
      if (!response.ok) {
        throw new Error('获取章节列表失败')
      }
      const data = await response.json()
      setChapters(data.items || [])
    } catch (err) {
      console.error('获取章节列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/v1/comments/novel/${novelId}?sort=${commentSort}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data || [])
      }
    } catch (err) {
      console.error('获取评论失败:', err)
    }
  }

  const checkCollectionStatus = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsCollected(false)
      return
    }
    try {
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

  const toggleCollection = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      const shouldLogin = confirm('请先登录\n\n是否现在登录？')
      if (shouldLogin) {
        window.location.href = '/login'
      }
      return
    }

    try {
      if (isCollected) {
        const response = await fetch(`/api/v1/bookshelf/${novelId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          setIsCollected(false)
          alert('已取消收藏')
        } else {
          alert('取消收藏失败')
        }
      } else {
        const response = await fetch('/api/v1/bookshelf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ novelId })
        })
        if (response.ok) {
          setIsCollected(true)
          alert('收藏成功！')
        } else {
          alert('收藏失败')
        }
      }
    } catch (err) {
      console.error('收藏操作失败:', err)
      alert('操作失败，请稍后重试')
    }
  }

  const submitComment = async () => {
    if (!newComment.trim()) {
      alert('请输入评论内容')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('请先登录')
      return
    }

    try {
      const response = await fetch(`/api/v1/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ novelId, content: newComment })
      })

      if (response.ok) {
        setNewComment('')
        fetchComments()
        alert('评论发表成功！')
      } else {
        alert('评论发表失败')
      }
    } catch (err) {
      alert('评论发表失败')
    }
  }

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      alert('请输入回复内容')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('请先登录')
      return
    }

    try {
      const response = await fetch(`/api/v1/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ novelId, content: replyContent, parentId })
      })

      if (response.ok) {
        setReplyContent('')
        setReplyingTo(null)
        fetchComments()
        alert('回复发表成功！')
      } else {
        alert('回复发表失败')
      }
    } catch (err) {
      alert('回复发表失败')
    }
  }

  const likeComment = async (commentId: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('请先登录')
      return
    }

    try {
      const response = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const result = await response.json()
        setComments(comments.map(c =>
          c.id === commentId
            ? { ...c, likeCount: result.likeCount, liked: result.liked }
            : c
        ))
      } else {
        const error = await response.json()
        alert(error.message || '点赞失败')
      }
    } catch (err) {
      console.error('点赞失败:', err)
      alert('点赞失败，请稍后重试')
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
              {/* 标题和评分 */}
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 className="text-2xl md:text-3xl font-bold">{novel.title}</h1>
                {novel.rating > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
                    <svg className="w-4 h-4 fill-yellow-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold">{novel.rating.toFixed(1)}</span>
                    <span className="text-xs opacity-70">({novel.ratingCount || 0}人评价)</span>
                  </div>
                )}
              </div>
              
              {/* 作者信息 */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-muted-foreground">作者：</span>
                <span className="font-medium text-foreground">{novel.authorName}</span>
                {novel.authorReputation !== undefined && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                    信誉分 {novel.authorReputation}
                  </span>
                )}
              </div>
              
              {/* 统计信息 */}
              <div className="flex flex-wrap gap-4 md:gap-6 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground">分类</div>
                    <div className="font-medium">{novel.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground">字数</div>
                    <div className="font-medium">{(novel.wordCount || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground">状态</div>
                    <div className="font-medium">{novel.status === 0 ? '连载中' : novel.status === 1 ? '已完结' : '暂停更新'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground">阅读</div>
                    <div className="font-medium">{(novel.viewCount || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              {novel.lastChapterUpdatedAt && (
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  最后更新：{new Date(novel.lastChapterUpdatedAt).toLocaleDateString()}
                </p>
              )}
              
              {/* 简介 */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {novel.summary || '暂无简介'}
                </p>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3">
                {chapters.length > 0 && (
                  <Link
                    href={`/novels/${novelId}/chapters/${chapters[0].id}`}
                    className="group inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    开始阅读
                  </Link>
                )}
                <button 
                  onClick={toggleCollection}
                  className={`group inline-flex items-center justify-center px-6 py-2.5 rounded-full border-2 transition-all ${
                    isCollected 
                      ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20' 
                      : 'border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill={isCollected ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {isCollected ? '已收藏' : '加入书架'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex gap-1 p-1 border-b bg-muted/30">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'chapters' 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              章节列表
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                {chapters.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'comments' 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              读者评论
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                {comments.length}
              </span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'chapters' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    <h3 className="font-semibold text-lg">全部章节</h3>
                  </div>
                  <div className="flex gap-2 p-1 bg-muted/50 rounded-full">
                    <button
                      onClick={() => setChapterOrder('asc')}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${chapterOrder === 'asc' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      正序
                    </button>
                    <button
                      onClick={() => setChapterOrder('desc')}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${chapterOrder === 'desc' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                      倒序
                    </button>
                  </div>
                </div>
                {chapters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-muted-foreground">暂无章节</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">作者正在努力创作中...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {chapters.map((chapter, index) => (
                      <Link
                        key={chapter.id}
                        href={`/novels/${novelId}/chapters/${chapter.id}`}
                        className="group p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                            {chapter.sequence}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {chapter.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {chapter.wordCount?.toLocaleString() || 0} 字
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

        {activeTab === 'comments' && (
          <div className="border rounded-lg p-6">
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">发表评论</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full px-4 py-3 border rounded-lg resize-none h-32 bg-background"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={submitComment}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  发表
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">全部评论</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCommentSort('newest')}
                    className={`text-sm px-3 py-1 rounded ${commentSort === 'newest' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  >
                    最新
                  </button>
                  <button
                    onClick={() => setCommentSort('hottest')}
                    className={`text-sm px-3 py-1 rounded ${commentSort === 'hottest' ? 'bg-primary text-primary-foreground' : 'border'}`}
                  >
                    最热
                  </button>
                </div>
              </div>
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">暂无评论，快来发表第一条评论吧！</p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{comment.authorName}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground mb-3">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => likeComment(comment.id)}
                          className={`text-sm flex items-center gap-1 ${comment.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          👍 {comment.likeCount}
                        </button>
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          回复
                        </button>
                      </div>

                      {/* 回复输入框 */}
                      {replyingTo === comment.id && (
                        <div className="mt-4 pl-4 border-l-2 border-border">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`回复 ${comment.authorName}...`}
                            className="w-full px-3 py-2 border rounded-lg resize-none h-20 bg-background text-sm"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-4 py-1 text-sm border rounded hover:bg-accent"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => submitReply(comment.id)}
                              className="px-4 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                            >
                              发表回复
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 回复列表 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{reply.authorName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 相关推荐 */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">相关推荐</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendations.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novels/${novel.id}`}
                  className="group"
                >
                  <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2">
                    {novel.cover ? (
                      <img
                        src={novel.cover}
                        alt={novel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        暂无封面
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {novel.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {novel.authorName} · {novel.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(novel.wordCount / 10000).toFixed(1)}万字
                  </p>
                </Link>
              ))}
            </div>
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
