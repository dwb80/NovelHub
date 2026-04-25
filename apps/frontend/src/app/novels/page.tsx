'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Novel } from '@/types'
import CategoryNav from '@/components/CategoryNav'
import { ChevronLeft, ChevronRight, Star, TrendingUp, Clock, ThumbsUp, X } from 'lucide-react'

type SortType = 'hot' | 'new' | 'rating'
type TargetAudienceType = 'all' | 'male' | 'female'
type SerialStatusType = 'all' | 'ongoing' | 'completed'
type WordCountRangeType = 'all' | 'lt10w' | '10w30w' | '30w50w' | '50w100w' | 'gt100w'

const targetAudienceOptions = [
  { value: 'all', label: '全部读者' },
  { value: 'male', label: '男生' },
  { value: 'female', label: '女生' },
]

const serialStatusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'ongoing', label: '连载中' },
  { value: 'completed', label: '已完结' },
]

const wordCountRangeOptions = [
  { value: 'all', label: '全部字数' },
  { value: 'lt10w', label: '10万以下' },
  { value: '10w30w', label: '10-30万' },
  { value: '30w50w', label: '30-50万' },
  { value: '50w100w', label: '50-100万' },
  { value: 'gt100w', label: '100万以上' },
]

function NovelsContentInner({ category }: { category: string | null }) {
  const router = useRouter()
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<SortType>('hot')

  // 筛选状态
  const [targetAudience, setTargetAudience] = useState<TargetAudienceType>('all')
  const [serialStatus, setSerialStatus] = useState<SerialStatusType>('all')
  const [wordCountRange, setWordCountRange] = useState<WordCountRangeType>('all')

  const itemsPerPage = 20

  useEffect(() => {
    fetchNovels()
  }, [category, currentPage, sortBy, targetAudience, serialStatus, wordCountRange])

  const fetchNovels = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      if (sortBy) params.append('sort', sortBy)
      if (targetAudience && targetAudience !== 'all') params.append('targetAudience', targetAudience)
      if (serialStatus && serialStatus !== 'all') params.append('serialStatus', serialStatus)
      if (wordCountRange && wordCountRange !== 'all') params.append('wordCountRange', wordCountRange)

      const url = `/api/v1/novels?${params.toString()}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('获取小说列表失败')
      }
      const data = await response.json()
      setNovels(data.novels || data.items || [])
      setTotalCount(data.total || 0)
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSortChange = (sort: SortType) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handleFilterChange = (
    type: 'targetAudience' | 'serialStatus' | 'wordCountRange',
    value: string
  ) => {
    setCurrentPage(1)
    switch (type) {
      case 'targetAudience':
        setTargetAudience(value as TargetAudienceType)
        break
      case 'serialStatus':
        setSerialStatus(value as SerialStatusType)
        break
      case 'wordCountRange':
        setWordCountRange(value as WordCountRangeType)
        break
    }
  }

  const clearAllFilters = () => {
    setTargetAudience('all')
    setSerialStatus('all')
    setWordCountRange('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = targetAudience !== 'all' || serialStatus !== 'all' || wordCountRange !== 'all'

  const getSortLabel = (sort: SortType) => {
    switch (sort) {
      case 'hot': return '最热'
      case 'new': return '最新'
      case 'rating': return '评分'
      default: return '最热'
    }
  }

  const getSortIcon = (sort: SortType) => {
    switch (sort) {
      case 'hot': return <TrendingUp className="w-4 h-4" />
      case 'new': return <Clock className="w-4 h-4" />
      case 'rating': return <ThumbsUp className="w-4 h-4" />
      default: return <TrendingUp className="w-4 h-4" />
    }
  }

  const getSerialStatusLabel = (status: string) => {
    switch (status) {
      case 'ONGOING': return '连载中';
      case 'COMPLETED': return '已完结';
      default: return status;
    }
  };

  const formatViewCount = (count: number) => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
  };

  return (
    <>
      {/* 分类导航 */}
      <CategoryNav />

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 筛选栏 */}
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 读者筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">读者:</span>
              <select
                value={targetAudience}
                onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {targetAudienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 状态筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">状态:</span>
              <select
                value={serialStatus}
                onChange={(e) => handleFilterChange('serialStatus', e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {serialStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 字数筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">字数:</span>
              <select
                value={wordCountRange}
                onChange={(e) => handleFilterChange('wordCountRange', e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {wordCountRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}



                {/* 清除全部 */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                    清除全部
                  </button>
                )}
            </div>
          </div>

          {/* 标题和排序 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {category ? '分类浏览' : '全部小说'}
              </h1>
              <p className="text-muted-foreground mt-1">
                共 {totalCount} 本小说
              </p>
            </div>

            {/* 排序选项 */}
            <div className="flex gap-2">
              {(['hot', 'new', 'rating'] as SortType[]).map((sort) => (
                <button
                  key={sort}
                  onClick={() => handleSortChange(sort)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${sortBy === sort
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                >
                  {getSortIcon(sort)}
                  {getSortLabel(sort)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-destructive">
              {error}
            </div>
          ) : novels.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-4">暂无小说</p>
              <p>成为第一个发布小说的作者吧！</p>
            </div>
          ) : (
            <>
              {/* 小说网格 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
                {novels.map((novel) => (
                  <Link
                    key={novel.id}
                    href={`/novels/${novel.id}`}
                    className="group block"
                  >
                    <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-3 relative">
                      {novel.cover ? (
                        <img
                          src={novel.cover}
                          alt={novel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          暂无封面
                        </div>
                      )}
                      {/* 评分标签 */}
                      {novel.rating > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {novel.rating.toFixed(1)}
                        </div>
                      )}
                      {/* 状态标签 */}
                      <div className="absolute top-2 left-2 bg-primary/80 text-white px-2 py-0.5 rounded-full text-xs">
                        {getSerialStatusLabel(novel.serialStatus)}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {novel.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {novel.authorName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{novel.category}</span>
                      <span>·</span>
                      <span>{novel.wordCount.toLocaleString()} 字</span>
                    </div>
                    {/* 阅读量和更新时间 */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatViewCount(novel.viewCount)} 阅读</span>
                      <span>·</span>
                      <span>{new Date(novel.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </button>

                  {/* 页码 */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'border bg-background hover:bg-accent'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 分页信息 */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                第 {currentPage} / {totalPages} 页，共 {totalCount} 本小说
              </div>
            </>
          )}
      </main>
    </>
  )
}

function NovelsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  return <NovelsContentInner category={category} />
}

export default function NovelsPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        </div>
      }>
        <NovelsContent />
      </Suspense>
    </MainLayout>
  )
}
