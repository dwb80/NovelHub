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
      setItems(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取书架失败')
    } finally {
      setLoading(false)
    }
  }

  const removeFromBookshelf = async (novelId: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/v1/bookshelf/${novelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setItems(items.filter(item => item.novelId !== novelId))
      }
    } catch (err) {
      console.error('移除失败:', err)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'READING': '阅读中',
      'COMPLETED': '已读完',
      'DROPPED': '已弃书',
      'WISHLIST': '想读'
    }
    return statusMap[status] || status
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <span className="text-4xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">书架是空的</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              您还没有收藏任何小说，去发现一些好书加入书架吧
            </p>
            <Link 
              href="/novels" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              去发现好书
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <Link href={`/novels/${item.novelId}`}>
                  <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-3">
                    {item.novelCover ? (
                      <img
                        src={item.novelCover}
                        alt={item.novelTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        暂无封面
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {item.novelTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.authorName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    进度：{item.progress.toFixed(1)}% · {getStatusText(item.status)}
                  </p>
                </Link>
                <button
                  onClick={() => removeFromBookshelf(item.novelId)}
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
