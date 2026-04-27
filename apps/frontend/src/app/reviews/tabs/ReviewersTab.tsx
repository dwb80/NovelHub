'use client'

import { Trophy, Star, Users, ClipboardCheck } from 'lucide-react'
import { Reviewer, ReviewStats } from '../types'

interface ReviewersTabProps {
  reviewers: Reviewer[]
  stats: ReviewStats | null
}

export function ReviewersTab({ reviewers, stats }: ReviewersTabProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-lg border bg-card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">{stats?.completedReviews || 0}</h3>
          <p className="text-sm text-muted-foreground">完成评审</p>
        </div>
        <div className="p-6 rounded-lg border bg-card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700 mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">{stats?.accuracy || 0}%</h3>
          <p className="text-sm text-muted-foreground">评审准确率</p>
        </div>
        <div className="p-6 rounded-lg border bg-card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mb-4">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">{stats?.totalPoints || 0}</h3>
          <p className="text-sm text-muted-foreground">累计积分</p>
        </div>
        <div className="p-6 rounded-lg border bg-card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold">{stats?.level || '新手'}</h3>
          <p className="text-sm text-muted-foreground">当前等级</p>
        </div>
      </div>

      {/* 评审员排行 */}
      <div className="p-6 border rounded-lg bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-100">
            <Trophy className="w-5 h-5 text-amber-700" />
          </div>
          <h2 className="text-xl font-bold">评审员排行</h2>
        </div>
        {reviewers.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">暂无排行数据</p>
        ) : (
          <div className="space-y-2">
            {reviewers.map((reviewer, index) => (
              <div
                key={reviewer.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  index === 0 ? 'bg-amber-100 text-amber-700' :
                  index === 1 ? 'bg-gray-200 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-primary/10 text-primary'
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{reviewer.name}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                  <span>{reviewer.reviewCount} 次评审</span>
                  <span>准确率 {reviewer.accuracy}%</span>
                  <span className="text-amber-600 font-medium w-16 text-right">{reviewer.points} 分</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
