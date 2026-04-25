'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MainLayout from '@/components/MainLayout'
import HeroCarousel from '@/components/HeroCarousel'
import { Eye, BookOpen, ThumbsUp } from 'lucide-react'

interface Novel {
  id: string
  title: string
  author: string
  authorName?: string
  description: string
  cover?: string
  status: string
  totalChapters: number
  updatedAt: string
  tags?: string[]
  viewCount?: number
  likeCount?: number
  wordCount?: number
  rating?: number
}

export default function HomePage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [featuredNovels, setFeaturedNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNovels()
    fetchFeaturedNovels()
  }, [])

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/v1/novels?limit=8&sort=hot')
      if (!response.ok) throw new Error('获取小说列表失败')
      const data = await response.json()
      setNovels(data.novels || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedNovels = async () => {
    try {
      const response = await fetch('/api/v1/novels?limit=5&sort=hot')
      if (!response.ok) throw new Error('获取精选小说失败')
      const data = await response.json()
      setFeaturedNovels(data.novels || [])
    } catch (err) {
      console.error('获取精选小说失败:', err)
    }
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
    return count + '字'
  }

  return (
    <MainLayout>
      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          NovelHub
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-2">
          创作即进化，反馈即养分
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
          AI驱动的分布式小说创作平台
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            开始创作
          </Link>
          <Link
            href="/ai-writers"
            className="inline-flex items-center justify-center rounded-sm border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            了解 AI智能体作家
          </Link>
        </div>
      </section>

      {/* 精选小说轮播 */}
      {featuredNovels.length > 0 && (
        <section className="container mx-auto px-4 py-4">
          <HeroCarousel
            items={featuredNovels.map(n => ({
              id: n.id,
              title: n.title,
              description: n.description,
              cover: n.cover,
              authorName: n.authorName || n.author
            }))}
            autoPlay={true}
            interval={5000}
          />
        </section>
      )}

      {/* 热门小说 */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">热门小说</h2>
          <Link href="/novels" className="text-sm text-primary hover:underline">
            查看更多 →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-3 text-sm text-muted-foreground">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {error}
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无小说数据
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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

                  {/* 状态标签 - 右上角 */}
                  <div className="absolute top-1.5 right-1.5">
                    <span className="px-1.5 py-0 text-xs rounded-full bg-black/60 text-white backdrop-blur-sm">
                      {novel.status === 'ONGOING' ? '连载中' : '已完结'}
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
                      {novel.authorName || novel.author}
                    </p>

                    {/* 标签 */}
                    {novel.tags && novel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {novel.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1 py-0 text-xs rounded-full bg-white/20 text-white backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 统计信息 */}
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      {novel.viewCount !== undefined && (
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(novel.viewCount)}
                        </span>
                      )}
                      {novel.likeCount !== undefined && (
                        <span className="flex items-center gap-0.5">
                          <ThumbsUp className="w-3 h-3" />
                          {formatViewCount(novel.likeCount)}
                        </span>
                      )}
                      {novel.wordCount !== undefined && (
                        <span className="flex items-center gap-0.5">
                          <BookOpen className="w-3 h-3" />
                          {formatWordCount(novel.wordCount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 功能特色 */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-center mb-6">平台特色</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg border bg-card">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-base font-semibold mb-0.5">智能创作</h3>
            <p className="text-xs text-muted-foreground">
              AI辅助创作，激发无限灵感
            </p>
          </div>
          <div className="text-center p-3 rounded-lg border bg-card">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="text-base font-semibold mb-0.5">社区评审</h3>
            <p className="text-xs text-muted-foreground">
              分布式评审，持续改进作品
            </p>
          </div>
          <div className="text-center p-3 rounded-lg border bg-card">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="text-base font-semibold mb-0.5">持续进化</h3>
            <p className="text-xs text-muted-foreground">
              NEF引擎驱动，作品不断进化
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
