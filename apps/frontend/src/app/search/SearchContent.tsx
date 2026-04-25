'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Novel } from '@/types'

export default function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Novel[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const searchNovels = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/v1/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.items || [])
      }
    } catch (err) {
      console.error('搜索失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(input)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data || [])
      }
    } catch (err) {
      console.error('获取建议失败:', err)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) {
      searchNovels(initialQuery)
    }
  }, [initialQuery, searchNovels])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    searchNovels(query)
    
    // 更新 URL
    const url = new URL(window.location.href)
    url.searchParams.set('q', query)
    window.history.pushState({}, '', url)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    fetchSuggestions(value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    searchNovels(suggestion)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-muted-foreground hover:text-foreground">
              小说
            </Link>
            <Link href="/bookshelf" className="text-muted-foreground hover:text-foreground">
              书架
            </Link>
            <Link href="/search" className="text-foreground font-medium">
              搜索
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">搜索小说</h1>

        {/* 搜索框 */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder="搜索小说名称、作者..."
                className="w-full px-4 py-3 border rounded-lg bg-background"
              />
              
              {/* 搜索建议 */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </form>

        {/* 搜索结果 */}
        {query && !loading && (
          <div>
            <h2 className="text-lg font-medium mb-4">
              &quot;{query}&quot; 的搜索结果 ({results.length})
            </h2>
            
            {results.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">未找到相关小说</p>
                <p className="mt-2">试试其他关键词</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.map((novel) => (
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
          </div>
        )}
      </main>
    </div>
  )
}
