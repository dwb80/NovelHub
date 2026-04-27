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
        <div className="flex gap-8 mb-8">
          <div className="w-48 flex-shrink-0">
            <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden">
              {novel.cover ? (
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  暂无封面
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>
            <p className="text-lg text-muted-foreground mb-2">
              作者：{novel.authorName}
              {novel.authorReputation !== undefined && (
                <span className="ml-3 text-sm">
                  信誉分：{novel.authorReputation}
                </span>
              )}
            </p>
            {novel.lastChapterUpdatedAt && (
              <p className="text-sm text-muted-foreground mb-4">
                最后更新：{new Date(novel.lastChapterUpdatedAt).toLocaleDateString()}
              </p>
            )}
            <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
              <span>分类：{novel.category}</span>
              <span>字数：{(novel.wordCount || 0).toLocaleString()}</span>
              <span>状态：{novel.status === 0 ? '连载中' : novel.status === 1 ? '已完结' : '暂停更新'}</span>
            </div>
            <div className="flex gap-4 mb-6">
              <span className="text-sm text-muted-foreground">
                阅读：{(novel.viewCount || 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                收藏：{(novel.collectCount || 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                评分：{(novel.rating || 0).toFixed(1)} ({novel.ratingCount || 0}人评价)
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {novel.summary}
            </p>
            <div className="flex gap-3">
              {chapters.length > 0 && (
                <Link
                  href={`/novels/${novelId}/chapters/${chapters[0].id}`}
                  className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  开始阅读
                </Link>
              )}
              <button 
                onClick={toggleCollection}
                className={`inline-flex items-center justify-center px-6 py-2 border rounded-md hover:bg-accent ${
                  isCollected ? 'bg-primary/10 border-primary text-primary' : ''
                }`}
              >
                {isCollected ? '取消收藏' : '加入书架'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-b mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chapters' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              章节列表 ({chapters.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'comments' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              评论 ({comments.length})
            </button>
          </div>
        </div>

        {activeTab === 'chapters' && (
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">全部章节</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setChapterOrder('asc')}
                  className={`text-sm px-3 py-1 rounded ${chapterOrder === 'asc' ? 'bg-primary text-primary-foreground' : 'border'}`}
                >
                  正序
                </button>
                <button
                  onClick={() => setChapterOrder('desc')}
                  className={`text-sm px-3 py-1 rounded ${chapterOrder === 'desc' ? 'bg-primary text-primary-foreground' : 'border'}`}
                >
                  倒序
                </button>
              </div>
            </div>
            {chapters.length === 0 ? (
              <p className="text-muted-foreground">暂无章节</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/novels/${novelId}/chapters/${chapter.id}`}
                    className="p-3 border rounded hover:bg-accent transition-colors"
                  >
                    <div className="text-sm font-medium truncate">
                      第{chapter.sequence}章 {chapter.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {chapter.wordCount} 字
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
