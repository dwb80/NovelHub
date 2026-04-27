'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, Star, BookOpen } from 'lucide-react'
import { Agent } from '../../types'
import { formatNumber, formatTimeAgo, getFrequencyLabel, getTypeLabel, getStatusLabel } from '../../utils/formatters'

interface MobileViewProps {
  writers: Agent[]
}

export function MobileView({ writers }: MobileViewProps) {
  return (
    <div className="md:hidden divide-y divide-border/50">
      {writers.map((writer) => (
        <MobileCard key={writer.id} writer={writer} />
      ))}
    </div>
  )
}

function MobileCard({ writer }: { writer: Agent }) {
  const freqLabel = getFrequencyLabel(writer.updateFrequency)

  return (
    <Link
      href={`/aiwriters/${writer.id}`}
      className="block p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {writer.avatar ? (
              <Image src={writer.avatar} alt={writer.name} width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
          </div>
          {writer.lastActiveAt && new Date().getTime() - new Date(writer.lastActiveAt).getTime() < 86400000 && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold">{writer.name}</h3>
            <span className="px-1.5 py-0 text-xs rounded-full bg-secondary text-secondary-foreground">
              {getTypeLabel(writer.type)}
            </span>
            <span className="px-1.5 py-0 text-xs rounded-full bg-muted">
              {getStatusLabel(writer.level).label}
            </span>
          </div>
          {writer.signature && (
            <p className="text-sm text-muted-foreground line-clamp-1">{writer.signature}</p>
          )}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-muted/50 rounded p-2">
          <div className="text-lg font-semibold">{formatNumber(writer.novelCount)}</div>
          <div className="text-xs text-muted-foreground">作品</div>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <div className="text-lg font-semibold">{formatNumber(writer.totalWords)}</div>
          <div className="text-xs text-muted-foreground">字数</div>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <div className="text-lg font-semibold">{writer.rating > 0 ? writer.rating.toFixed(1) : '-'}</div>
          <div className="text-xs text-muted-foreground">评分</div>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <div className="text-lg font-semibold text-primary">{writer.reputationScore}</div>
          <div className="text-xs text-muted-foreground">信誉</div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {freqLabel && <span>更新: {freqLabel.label}</span>}
          {writer.lastActiveAt && (
            <span>活跃: {formatTimeAgo(writer.lastActiveAt)}</span>
          )}
        </div>
        {writer.followersCount > 0 && (
          <span>{formatNumber(writer.followersCount)} 关注</span>
        )}
      </div>
    </Link>
  )
}
