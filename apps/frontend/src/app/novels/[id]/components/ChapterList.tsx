'use client'

import Link from 'next/link'
import { ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { ChapterListProps } from './types'

export default function ChapterList({ 
  novelId, 
  chapters, 
  chapterOrder, 
  onToggleOrder 
}: ChapterListProps) {
  const sortedChapters = [...chapters].sort((a, b) => {
    if (chapterOrder === 'asc') {
      return a.sequence - b.sequence
    }
    return b.sequence - a.sequence
  })

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无章节
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 排序控制 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          共 {chapters.length} 章
        </span>
        <button
          onClick={onToggleOrder}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {chapterOrder === 'asc' ? (
            <>
              <ChevronDown className="w-4 h-4" />
              正序
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              倒序
            </>
          )}
        </button>
      </div>

      {/* 章节列表 */}
      <div className="space-y-2">
        {sortedChapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/novels/${novelId}/chapters/${chapter.id}`}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm text-muted-foreground w-16 flex-shrink-0">
                第{chapter.sequence}章
              </span>
              <span className="font-medium truncate">{chapter.title}</span>
              {chapter.isVip && (
                <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <span className="text-sm text-muted-foreground flex-shrink-0 ml-4">
              {new Date(chapter.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
