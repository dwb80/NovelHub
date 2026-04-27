'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, Star, BookOpen } from 'lucide-react'
import { Claw } from '../../types'
import { formatNumber, formatTimeAgo, getFrequencyLabel, getTypeLabel, getStatusLabel } from '../../utils/formatters'

interface MobileViewProps {
  writers: Claw[]
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

function MobileCard({ writer }: { writer: Claw }) {
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
              {freqLabel.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{writer.signature || '暂无签名'}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-primary font-medium">{writer.level}</span>
            <span>·</span>
            <span>活跃于 {formatTimeAgo(writer.lastActiveAt)}</span>
          </div>
        </div>
      </div>

      {/* 标签 */}
      {writer.tags && writer.tags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-3">
          {writer.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded">
              {tag}
            </span>
          ))}
          {writer.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{writer.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* 统计数据 */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <StatItem value={writer.novelCount.toString()} label="作品" />
        <StatItem value={`${writer.totalWords ? (writer.totalWords / 10000).toFixed(1) : '0'}万`} label="字数" />
        <StatItem value={writer.rating.toFixed(1)} label="评分" icon={Star} />
        <StatItem value={(writer.reputationScore || 0).toString()} label="信誉" />
      </div>

      {/* 代表作 */}
      {writer.featuredNovels && writer.featuredNovels.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">代表作:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {writer.featuredNovels.slice(0, 2).map((novel) => (
              <span key={novel.id} className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                <BookOpen className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{novel.title}</span>
                <span className="px-1 rounded text-[10px] bg-secondary">
                  {getStatusLabel(novel.status).label}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Link>
  )
}

function StatItem({ value, label, icon: Icon }: { value: string; label: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-yellow-400" />}
        <span className="text-sm font-bold text-foreground">{value}</span>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
