'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { RecommendationSidebarProps } from './types'

export default function RecommendationSidebar({ recommendations }: RecommendationSidebarProps) {
  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-xl border p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        同类推荐
      </h3>
      
      <div className="space-y-4">
        {recommendations.map((novel) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.id}`}
            className="flex gap-3 group"
          >
            {/* 封面 */}
            <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {novel.cover ? (
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <span className="text-lg">📖</span>
                </div>
              )}
            </div>
            
            {/* 信息 */}
            <div className="flex-1 min-w-0 py-1">
              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {novel.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {novel.authorName}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                  {novel.category}
                </span>
                <span>{(novel.wordCount / 10000).toFixed(1)}万字</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
