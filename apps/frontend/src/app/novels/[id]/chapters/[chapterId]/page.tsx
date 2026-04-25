'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Chapter, Novel } from '@/types'

interface ReaderSettings {
  fontSize: number
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
  fontFamily: string
}

export default function ChapterReaderPage() {
  const params = useParams()
  const novelId = params.id as string
  const chapterId = params.chapterId as string
  
  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    lineHeight: 1.8,
    theme: 'light',
    fontFamily: 'system-ui'
  })

  // 从 localStorage 加载设置
  useEffect(() => {
    const saved = localStorage.getItem('readerSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  // 保存设置到 localStorage
  const saveSettings = useCallback((newSettings: ReaderSettings) => {
    setSettings(newSettings)
    localStorage.setItem('readerSettings', JSON.stringify(newSettings))
  }, [])

  useEffect(() => {
    if (novelId && chapterId) {
      fetchData()
    }
  }, [novelId, chapterId])

  const fetchData = async () => {
    try {
      // 获取小说信息
      const novelRes = await fetch(`/api/v1/novels/${novelId}`)
      if (!novelRes.ok) throw new Error('获取小说信息失败')
      const novelData = await novelRes.json()
      setNovel(novelData)

      // 获取章节列表
      const chaptersRes = await fetch(`/api/v1/novels/${novelId}/chapters`)
      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json()
        setChapters(chaptersData.items || [])
      }

      // 获取当前章节
      const chapterRes = await fetch(`/api/v1/novels/${novelId}/chapters/${chapterId}`)
      if (!chapterRes.ok) throw new Error('获取章节内容失败')
      const chapterData = await chapterRes.json()
      setChapter(chapterData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const currentIndex = chapters.findIndex(c => c.id === chapterId)
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null

  // 主题样式
  const themeStyles = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]'
  }

  // 添加书签功能
  const addBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    const newBookmark = {
      novelId,
      chapterId,
      novelTitle: novel?.title,
      chapterTitle: chapter?.title,
      timestamp: Date.now()
    }
    // 检查是否已存在
    const exists = bookmarks.find((b: any) => b.novelId === novelId && b.chapterId === chapterId)
    if (!exists) {
      bookmarks.push(newBookmark)
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
      alert('书签添加成功！')
    } else {
      alert('该章节已添加书签')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error || !chapter || !novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive">{error || '章节不存在'}</div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeStyles[settings.theme]}`}>
      {/* 顶部导航 */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/novels/${novelId}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← 返回目录
          </Link>
          <h1 className="text-sm font-medium truncate max-w-md">
            {novel.title}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={addBookmark}
              className="p-2 text-muted-foreground hover:text-foreground"
              title="添加书签"
            >
              🔖
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-muted-foreground hover:text-foreground"
              title="阅读设置"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 设置面板 */}
      {showSettings && (
        <div className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 字体大小 */}
              <div>
                <label className="text-sm font-medium mb-2 block">字体大小</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveSettings({ ...settings, fontSize: Math.max(12, settings.fontSize - 2) })}
                    className="px-3 py-1 border rounded hover:bg-accent"
                  >
                    A-
                  </button>
                  <span className="text-sm">{settings.fontSize}px</span>
                  <button
                    onClick={() => saveSettings({ ...settings, fontSize: Math.min(32, settings.fontSize + 2) })}
                    className="px-3 py-1 border rounded hover:bg-accent"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* 行间距 */}
              <div>
                <label className="text-sm font-medium mb-2 block">行间距</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveSettings({ ...settings, lineHeight: Math.max(1.2, settings.lineHeight - 0.2) })}
                    className="px-3 py-1 border rounded hover:bg-accent"
                  >
                    紧凑
                  </button>
                  <button
                    onClick={() => saveSettings({ ...settings, lineHeight: Math.min(2.5, settings.lineHeight + 0.2) })}
                    className="px-3 py-1 border rounded hover:bg-accent"
                  >
                    宽松
                  </button>
                </div>
              </div>

              {/* 主题 */}
              <div>
                <label className="text-sm font-medium mb-2 block">主题</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveSettings({ ...settings, theme: 'light' })}
                    className={`px-3 py-1 border rounded ${settings.theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    白天
                  </button>
                  <button
                    onClick={() => saveSettings({ ...settings, theme: 'dark' })}
                    className={`px-3 py-1 border rounded ${settings.theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    夜间
                  </button>
                  <button
                    onClick={() => saveSettings({ ...settings, theme: 'sepia' })}
                    className={`px-3 py-1 border rounded ${settings.theme === 'sepia' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    护眼
                  </button>
                </div>
              </div>

              {/* 字体 */}
              <div>
                <label className="text-sm font-medium mb-2 block">字体</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => saveSettings({ ...settings, fontFamily: e.target.value })}
                  className="px-3 py-1 border rounded bg-background"
                >
                  <option value="system-ui">系统默认</option>
                  <option value="serif">宋体</option>
                  <option value="sans-serif">黑体</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 章节内容 */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-8">
          第{chapter.sequence}章 {chapter.title}
        </h1>
        
        <article 
          className="reader-content"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily
          }}
        >
          {chapter.content ? (
            chapter.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 indent-8">{paragraph}</p>
            ))
          ) : (
            <p className="text-center text-muted-foreground">暂无内容</p>
          )}
        </article>

        {/* 章节导航 */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          {prevChapter ? (
            <Link
              href={`/novels/${novelId}/chapters/${prevChapter.id}`}
              className="px-6 py-2 border rounded-md hover:bg-accent"
            >
              ← 上一章
            </Link>
          ) : (
            <div />
          )}
          
          <Link
            href={`/novels/${novelId}`}
            className="px-6 py-2 border rounded-md hover:bg-accent"
          >
            目录
          </Link>
          
          {nextChapter ? (
            <Link
              href={`/novels/${novelId}/chapters/${nextChapter.id}`}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              下一章 →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  )
}
