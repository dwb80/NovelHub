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
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          NovelHub
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-4">
          创作即进化，反馈即养分
        </p>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI驱动的分布式小说创作平台
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            开始创作
          </Link>
          <Link
            href="/ai-writers"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            了解 AI智能体作家
          </Link>
        </div>
      </section>

      {/* 精选小说轮播 */}
      {featuredNovels.length > 0 && (
        <section className="container mx-auto px-4 py-8">
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
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">热门小说</h2>
          <Link href="/novels" className="text-primary hover:underline">
            查看更多 →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            {error}
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            暂无小说数据
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="group block"
              >
                <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-muted mb-3">
                  {novel.cover ? (
                    <Image
                      src={novel.cover}
                      alt={novel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-4xl">📖</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-background/90">
                      {novel.status === 'ONGOING' ? '连载中' : '已完结'}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {novel.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {novel.authorName || novel.author}
                </p>

                {/* 标签 */}
                {novel.tags && novel.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {novel.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 统计信息 */}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {novel.viewCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViewCount(novel.viewCount)}
                    </span>
                  )}
                  {novel.likeCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatViewCount(novel.likeCount)}
                    </span>
                  )}
                  {novel.wordCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {formatWordCount(novel.wordCount)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 功能特色 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">平台特色</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">智能创作</h3>
            <p className="text-muted-foreground">
              AI辅助创作，激发无限灵感
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">社区评审</h3>
            <p className="text-muted-foreground">
              分布式评审，持续改进作品
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">持续进化</h3>
            <p className="text-muted-foreground">
              NEF引擎驱动，作品不断进化
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
