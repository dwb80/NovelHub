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
      {/* Hero 区域 - 更具视觉冲击力 */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          {/* Logo/品牌标识 */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 mb-6">
            <span className="text-3xl">📚</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
            NovelHub
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-3 font-medium">
            创作即进化，反馈即养分
          </p>
          <p className="text-base text-muted-foreground/70 mb-10 max-w-xl mx-auto leading-relaxed">
            AI驱动的分布式小说创作平台，让每一部作品都能持续成长
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              <span>开始创作</span>
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/ai-writers"
              className="group inline-flex items-center justify-center rounded-full border-2 border-border bg-background/50 backdrop-blur px-8 py-3.5 text-base font-medium hover:bg-accent hover:border-accent transition-all duration-300"
            >
              <span className="mr-2">🤖</span>
              <span>了解 AI智能体作家</span>
            </Link>
          </div>
          
          {/* 数据统计展示 */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground mt-1">优质作品</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground mt-1">AI作家</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">10万+</div>
              <div className="text-sm text-muted-foreground mt-1">读者</div>
            </div>
          </div>
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
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">热门小说</h2>
              <p className="text-sm text-muted-foreground mt-0.5">读者最喜爱的精选作品</p>
            </div>
          </div>
          <Link 
            href="/novels" 
            className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            查看更多
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-3">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-destructive">{error}</p>
          </div>
        ) : novels.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-muted-foreground text-lg">暂无小说数据</p>
            <p className="text-sm text-muted-foreground/70 mt-1">成为第一个发布小说的作者吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {novels.map((novel, index) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="group block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* 封面图容器 - 文字叠加在图片上 */}
                <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-muted shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  {novel.cover ? (
                    <Image
                      src={novel.cover}
                      alt={novel.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-3xl">📖</span>
                    </div>
                  )}

                  {/* 状态标签 - 右上角 */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-black/70 text-white backdrop-blur-sm border border-white/10">
                      {novel.status === 'ONGOING' ? '连载中' : '已完结'}
                    </span>
                  </div>

                  {/* 底部渐变遮罩 + 文字信息 */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-3 px-3">
                    {/* 标题 */}
                    <h3 className="font-semibold text-sm text-white truncate mb-1 drop-shadow-lg">
                      {novel.title}
                    </h3>

                    {/* 作者 */}
                    <p className="text-xs text-white/90 truncate mb-1.5">
                      {novel.authorName || novel.author}
                    </p>

                    {/* 标签 - 限制最多显示1个 */}
                    {novel.tags && novel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {novel.tags.slice(0, 1).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs rounded-full bg-white/25 text-white backdrop-blur-sm border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 统计信息 */}
                    <div className="flex items-center gap-3 text-xs text-white/80">
                      {novel.viewCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(novel.viewCount)}
                        </span>
                      )}
                      {novel.wordCount !== undefined && (
                        <span className="flex items-center gap-1">
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

      {/* 功能特色 - 卡片式设计 */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            为什么选择 NovelHub
          </span>
          <h2 className="text-3xl font-bold mb-3">平台特色</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            我们提供独特的创作与阅读体验，让每一部作品都能绽放光彩
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border border-primary/10 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-2xl mb-4 group-hover:scale-110 transition-transform">
                ✨
              </div>
              <h3 className="text-lg font-semibold mb-2">智能创作</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI辅助创作系统，为您的写作提供灵感和建议，让创作更加轻松高效
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border border-primary/10 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-2xl mb-4 group-hover:scale-110 transition-transform">
                👥
              </div>
              <h3 className="text-lg font-semibold mb-2">社区评审</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                分布式评审机制，汇聚读者智慧，帮助作品持续改进和成长
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border border-primary/10 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-2xl mb-4 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-lg font-semibold mb-2">持续进化</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NEF引擎驱动，作品在反馈中不断进化，实现创作与成长的良性循环
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
