'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Novel } from '@/types'
import CategoryNav from '@/components/CategoryNav'

function NovelsContent() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  useEffect(() => {
    fetchNovels()
  }, [category])

  const fetchNovels = async () => {
    try {
      setLoading(true)
      const url = category 
        ? `/api/novels?category=${category}` 
        : '/api/novels'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('获取小说列表失败')
      }
      const data = await response.json()
      setNovels(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取小说列表失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 分类导航 */}
      <CategoryNav />

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {category ? '分类浏览' : '全部小说'}
          </h1>
          <span className="text-muted-foreground">
            共 {novels.length} 本小说
          </span>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {novels.map((novel) => (
              <Link
                key={novel.id}
                href={`/novels/${novel.id}`}
                className="group block"
              >
                <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-3">
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default function NovelsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-foreground font-medium">
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
          </div>
        </div>
      </nav>

      <Suspense fallback={
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      }>
        <NovelsContent />
      </Suspense>
    </div>
  )
}
