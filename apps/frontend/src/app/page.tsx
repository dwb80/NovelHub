'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MainLayout from '@/components/MainLayout'

interface Novel {
  id: string
  title: string
  author: string
  description: string
  cover?: string
  status: string
  totalChapters: number
  updatedAt: string
}

export default function HomePage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNovels()
  }, [])

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/v1/novels?limit=12')
      if (!response.ok) throw new Error('获取小说列表失败')
      const data = await response.json()
      setNovels(data.novels || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说列表失败')
    } finally {
      setLoading(false)
    }
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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
                  {novel.author}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {novel.totalChapters} 章
                </p>
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
