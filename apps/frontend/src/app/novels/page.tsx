'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Novel } from '@/types'
import CategoryNav from '@/components/CategoryNav'
import { ChevronLeft, ChevronRight, Star, TrendingUp, Clock, ThumbsUp, X, Eye, BookOpen } from 'lucide-react'
import Image from 'next/image'

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
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortBy, setSortBy] = useState<SortType>('hot')

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
    if (type === 'targetAudience') {
      setTargetAudience(value as TargetAudienceType)
    } else if (type === 'serialStatus') {
      setSerialStatus(value as SerialStatusType)
    } else if (type === 'wordCountRange') {
      setWordCountRange(value as WordCountRangeType)
    }
  }

  const clearAllFilters = () => {
    setTargetAudience('all')
    setSerialStatus('all')
    setWordCountRange('all')
    setCurrentPage(1)
  }

  const hasActiveFilters = targetAudience !== 'all' || serialStatus !== 'all' || wordCountRange !== 'all'

  const getSortLabel = (sort: SortType): string => {
    if (sort === 'hot') return '最热'
    if (sort === 'new') return '最新'
    if (sort === 'rating') return '评分'
    return '最热'
  }

  const getSortIcon = (sort: SortType) => {
    if (sort === 'hot') return <TrendingUp className="w-4 h-4" />
    if (sort === 'new') return <Clock className="w-4 h-4" />
    if (sort === 'rating') return <ThumbsUp className="w-4 h-4" />
    return <TrendingUp className="w-4 h-4" />
  }

  const getSerialStatusLabel = (status: string): string => {
    if (status === 'ONGOING') return '连载中'
    if (status === 'COMPLETED') return '已完结'
    return status
  }

  const formatViewCount = (count: number): string => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
  }

  const formatWordCount = (count: number): string => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万字'
    }
    return count.toString() + '字'
  }

  return (
    <>
      <CategoryNav />
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
              </select>
            </div>

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-10">
              {novels.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novels/${novel.id}`}
                  className="group block"
                >
                  {/* 封面图容器 - 文字叠加在图片上 */}
                  <div className="aspect-[4/5] relative rounded overflow-hidden bg-muted">
                    {novel.cover ? (
                      <Image
                        src={novel.cover}
                        alt={novel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <span className="text-3xl">📖</span>
                      </div>
                    )}

                    {/* 评分标签 - 右上角 */}
                    {novel.rating > 0 && (
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/60 text-white px-1.5 py-0 rounded-full text-xs backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {novel.rating.toFixed(1)}
                      </div>
                    )}

                    {/* 状态标签 - 左上角 */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className="px-1.5 py-0 text-xs rounded-full bg-primary/80 text-white backdrop-blur-sm">
                        {getSerialStatusLabel(novel.serialStatus)}
                      </span>
                    </div>

                    {/* 底部渐变遮罩 + 文字信息 */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-2 px-2">
                      {/* 标题 */}
                      <h3 className="font-semibold text-sm text-white truncate mb-0 drop-shadow-md">
                        {novel.title}
                      </h3>

                      {/* 作者 */}
                      <p className="text-xs text-white/80 truncate mb-1">
                        {novel.authorName}
                      </p>

                      {/* 分类标签 */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        <span className="px-1 py-0 text-xs rounded-full bg-white/20 text-white backdrop-blur-sm">
                          {novel.category}
                        </span>
                      </div>

                      {/* 统计信息 */}
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(novel.viewCount)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <BookOpen className="w-3 h-3" />
                          {formatWordCount(novel.wordCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页 */}
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
