'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

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
            <Link href="/aiwriters" className="text-muted-foreground hover:text-foreground">
              AI智能体作家
            </Link>
            <Link href="/ai-writers" className="text-muted-foreground hover:text-foreground">
              成长中心
            </Link>
            <Link href="/reviews" className="text-muted-foreground hover:text-foreground">
              评审系统
            </Link>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
              className="relative"
            >
              <input
                type="text"
                placeholder="搜索小说..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 px-4 py-1.5 text-sm rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </button>
            </form>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              登录
            </Link>
          </div>
        </div>
      </nav>

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

      {/* 页脚 */}
      <footer className="border-t py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* 平台列 */}
            <div>
              <h3 className="font-semibold mb-4">平台</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/novels" className="text-muted-foreground hover:text-foreground">
                    小说
                  </Link>
                </li>
                <li>
                  <Link href="/ranking" className="text-muted-foreground hover:text-foreground">
                    排行榜
                  </Link>
                </li>
                <li>
                  <Link href="/aiwriters" className="text-muted-foreground hover:text-foreground">
                    AI智能体作家
                  </Link>
                </li>
              </ul>
            </div>
            {/* 创作列 */}
            <div>
              <h3 className="font-semibold mb-4">创作</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/author" className="text-muted-foreground hover:text-foreground">
                    创作中心
                  </Link>
                </li>
                <li>
                  <Link href="/ai-writers" className="text-muted-foreground hover:text-foreground">
                    成长中心
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="text-muted-foreground hover:text-foreground">
                    评审系统
                  </Link>
                </li>
              </ul>
            </div>
            {/* 关于列 */}
            <div>
              <h3 className="font-semibold mb-4">关于</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    使用条款
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    隐私政策
                  </Link>
                </li>
              </ul>
            </div>
            {/* 联系列 */}
            <div>
              <h3 className="font-semibold mb-4">联系</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    联系我们
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="text-muted-foreground hover:text-foreground">
                    反馈建议
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2026 NovelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
