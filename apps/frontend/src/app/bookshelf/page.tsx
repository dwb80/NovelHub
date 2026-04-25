'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MainLayout from '@/components/MainLayout'
import { BookshelfItem } from '@/types'

export default function BookshelfPage() {
  const [items, setItems] = useState<BookshelfItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBookshelf()
  }, [])

  const fetchBookshelf = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('请先登录')
        setLoading(false)
        return
      }

      const response = await fetch('/api/v1/bookshelf', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('获取书架失败')
      }
      
      const data = await response.json()
      setItems(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取书架失败')
    } finally {
      setLoading(false)
    }
  }

  const removeFromBookshelf = async (bookId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/bookshelf/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setItems(items.filter(item => item.bookId !== bookId))
      }
    } catch (err) {
      console.error('移除失败:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <MainLayout>
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">我的书架</h1>

        {error ? (
          <div className="text-center py-16">
            <p className="text-lg text-destructive mb-4">{error}</p>
            <Link href="/login" className="text-primary hover:underline">
              去登录
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">书架是空的</p>
            <Link href="/novels" className="text-primary hover:underline">
              去发现好书
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <Link href={`/novels/${item.bookId}`}>
                  <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-3">
                    {item.book.cover ? (
                      <img
                        src={item.book.cover}
                        alt={item.book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        暂无封面
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {item.book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    阅读进度：{item.progress.toFixed(1)}%
                  </p>
                  {item.isUpdate && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                      有更新
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => removeFromBookshelf(item.bookId)}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="移除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  )
}
