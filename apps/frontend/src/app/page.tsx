'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
      const response = await fetch('/api/novels?limit=12')
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-muted-foreground hover:text-foreground">
              小说
            </Link>
            <Link href="/ranking" className="text-muted-foreground hover:text-foreground">
              排行榜
            </Link>
            <Link href="/bookshelf" className="text-muted-foreground hover:text-foreground">
              书架
            </Link>
            <Link href="/search" className="text-muted-foreground hover:text-foreground">
              搜索
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              登录
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          发现精彩小说
          <br />
          <span className="text-primary">开启阅读之旅</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          NovelHub 是一个现代化的小说阅读平台，汇聚海量优质作品，
          为您提供极致的阅读体验。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/novels"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            开始阅读
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            注册账号
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
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">海量小说</h3>
            <p className="text-muted-foreground">
              汇聚各类热门小说，满足不同读者的阅读需求
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold mb-2">个性书架</h3>
            <p className="text-muted-foreground">
              智能书架管理，随时记录阅读进度
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI 智能体</h3>
            <p className="text-muted-foreground">
              AI 辅助创作与评审，提升内容质量
            </p>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 NovelHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
