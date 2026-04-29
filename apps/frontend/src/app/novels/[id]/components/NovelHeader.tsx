'use client'

import Link from 'next/link'
import { Bookmark, BookOpen, Share2, Clock } from 'lucide-react'
import { NovelHeaderProps } from './types'

export default function NovelHeader({ 
  novel, 
  chapters, 
  readingProgress, 
  isCollected, 
  onToggleCollection 
}: NovelHeaderProps) {
  const startReadingUrl = chapters.length > 0 
    ? `/novels/${novel.id}/chapters/${chapters[0].id}`
    : null

  const continueReadingUrl = readingProgress?.chapterId
    ? `/novels/${novel.id}/chapters/${readingProgress.chapterId}`
    : startReadingUrl

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/50 border shadow-lg mb-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8">
        {/* 封面图 */}
        <div className="w-32 md:w-48 flex-shrink-0 mx-auto md:mx-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-xl shadow-black/10">
            {novel.cover ? (
              <img
                src={novel.cover}
                alt={novel.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <span className="text-4xl">📖</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 信息区域 */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{novel.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {novel.category}
            </span>
            <span>{novel.authorName}</span>
            <span>·</span>
            <span>{novel.wordCount?.toLocaleString() || 0} 字</span>
            <span>·</span>
            <span>{novel.status === 1 ? '已完结' : '连载中'}</span>
          </div>
          
          <p className="text-muted-foreground mb-6 line-clamp-3">
            {novel.summary}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {continueReadingUrl ? (
              <Link href={continueReadingUrl}>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <BookOpen className="w-4 h-4" />
                  {readingProgress ? '继续阅读' : '开始阅读'}
                </button>
              </Link>
            ) : (
              <button disabled className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-lg font-medium cursor-not-allowed">
                <BookOpen className="w-4 h-4" />
                暂无章节
              </button>
            )}
            
            <button
              onClick={onToggleCollection}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isCollected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'border border-input bg-background hover:bg-accent'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isCollected ? 'fill-current' : ''}`} />
              {isCollected ? '已收藏' : '收藏'}
            </button>
            
            <button className="inline-flex items-center gap-2 px-6 py-3 border border-input bg-background rounded-lg font-medium hover:bg-accent transition-colors">
              <Share2 className="w-4 h-4" />
              分享
            </button>
          </div>

          {/* 阅读进度 */}
          {readingProgress && readingProgress.percentage > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span>阅读进度</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${readingProgress.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{readingProgress.percentage}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
