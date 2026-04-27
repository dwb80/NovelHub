'use client'

import { useState, useEffect } from 'react'
import { Eye, ChevronLeft, ChevronRight, FileText, Star, Calendar, User, BookOpen } from 'lucide-react'

interface ReviewInsight {
  id: string
  category: string
  severity: string
  title: string
  description: string
  suggestion?: string
  location?: string
}

interface ReviewRecord {
  id: string
  taskId: string
  reviewerId: string
  reviewerName: string
  chapterId: string
  chapterTitle: string
  novelId?: string
  novelTitle?: string
  overallScore: number
  plotRating?: number
  characterRating?: number
  pacingRating?: number
  styleRating?: number
  overallComment?: string
  status: string
  chapterStatus?: string
  createdAt: string
  claimedAt?: string
  completedAt?: string
  insights?: ReviewInsight[]
}

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function ReviewListTab() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/v1/reviews?page=${pagination.page}&limit=${pagination.limit}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0
        }))
      } else {
        setError('获取评审记录失败')
      }
    } catch (err) {
      setError('加载数据失败')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const openDetail = (review: ReviewRecord) => {
    setSelectedReview(review)
    setShowDetail(true)
  }

  const closeDetail = () => {
    setShowDetail(false)
    setSelectedReview(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600'
    if (score >= 7) return 'text-blue-600'
    if (score >= 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'PLOT': '剧情',
      'CHARACTER': '人物',
      'RHYTHM': '节奏',
      'STYLE': '文笔',
      'CRAFT': '技巧'
    }
    return labels[category] || category
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR': return 'bg-red-100 text-red-700'
      case 'WARNING': return 'bg-yellow-100 text-yellow-700'
      case 'INFO': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getChapterStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      'DRAFT': '草稿',
      'PENDING': '待审核',
      'REVIEWING': '审核中',
      'PUBLISHED': '已发布',
      'REJECTED': '已拒绝',
      'ARCHIVED': '已归档'
    }
    return labels[status || ''] || status || '未知'
  }

  const getChapterStatusColor = (status?: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      case 'REVIEWING': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          评审记录
        </h2>
        <p className="text-muted-foreground mt-2">
          共 {pagination.total} 条评审记录
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-card">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">暂无评审记录</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Novel & Chapter Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{review.novelTitle || '未知小说'}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{review.chapterTitle}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{review.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>提交: {formatDate(review.completedAt || review.createdAt)}</span>
                      </div>
                      {review.claimedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>领取: {formatDate(review.claimedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Score & Status & Action */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(review.overallScore)}`}>
                        {review.overallScore}
                      </div>
                      <div className="text-xs text-muted-foreground">综合评分</div>
                    </div>
                    <div className="text-center">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getChapterStatusColor(review.chapterStatus)}`}>
                        {getChapterStatusLabel(review.chapterStatus)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">章节状态</div>
                    </div>
                    <button
                      onClick={() => openDetail(review)}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                  </div>
                </div>

                {/* Rating Details */}
                {(review.plotRating || review.characterRating || review.pacingRating || review.styleRating) && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                    {review.plotRating && (
                      <div className="text-center">
                        <div className="text-lg font-semibold">{review.plotRating}</div>
                        <div className="text-xs text-muted-foreground">剧情</div>
                      </div>
                    )}
                    {review.characterRating && (
                      <div className="text-center">
                        <div className="text-lg font-semibold">{review.characterRating}</div>
                        <div className="text-xs text-muted-foreground">人物</div>
                      </div>
                    )}
                    {review.pacingRating && (
                      <div className="text-center">
                        <div className="text-lg font-semibold">{review.pacingRating}</div>
                        <div className="text-xs text-muted-foreground">节奏</div>
                      </div>
                    )}
                    {review.styleRating && (
                      <div className="text-center">
                        <div className="text-lg font-semibold">{review.styleRating}</div>
                        <div className="text-xs text-muted-foreground">文笔</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2">
                第 {pagination.page} / {pagination.totalPages} 页
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetail && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">评审详情</h3>
                <button
                  onClick={closeDetail}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Basic Info */}
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">小说:</span>
                    <span className="ml-2 font-medium">{selectedReview.novelTitle || '未知'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">章节:</span>
                    <span className="ml-2 font-medium">{selectedReview.chapterTitle}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">评审员:</span>
                    <span className="ml-2 font-medium">{selectedReview.reviewerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">提交时间:</span>
                    <span className="ml-2 font-medium">
                      {formatDate(selectedReview.completedAt || selectedReview.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  评分详情
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(selectedReview.overallScore)}`}>
                      {selectedReview.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">综合评分</div>
                  </div>
                  {selectedReview.plotRating && (
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedReview.plotRating}</div>
                      <div className="text-sm text-muted-foreground">剧情</div>
                    </div>
                  )}
                  {selectedReview.characterRating && (
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedReview.characterRating}</div>
                      <div className="text-sm text-muted-foreground">人物</div>
                    </div>
                  )}
                  {selectedReview.pacingRating && (
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedReview.pacingRating}</div>
                      <div className="text-sm text-muted-foreground">节奏</div>
                    </div>
                  )}
                  {selectedReview.styleRating && (
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedReview.styleRating}</div>
                      <div className="text-sm text-muted-foreground">文笔</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Comment */}
              {selectedReview.overallComment && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">总体评价</h4>
                  <div className="p-4 border rounded-lg bg-muted">
                    <p className="whitespace-pre-wrap">{selectedReview.overallComment}</p>
                  </div>
                </div>
              )}

              {/* Insights */}
              {selectedReview.insights && selectedReview.insights.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4">详细洞察</h4>
                  <div className="space-y-4">
                    {selectedReview.insights.map((insight) => (
                      <div key={insight.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(insight.severity)}`}>
                            {insight.severity === 'ERROR' ? '错误' : insight.severity === 'WARNING' ? '警告' : '提示'}
                          </span>
                          <span className="px-2 py-1 text-xs rounded bg-secondary">
                            {getCategoryLabel(insight.category)}
                          </span>
                          <span className="font-medium">{insight.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        {insight.suggestion && (
                          <p className="text-sm">
                            <span className="text-primary">建议:</span> {insight.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
