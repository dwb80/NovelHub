'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, Star } from 'lucide-react'
import { Claw, SortType } from '../../types'
import { formatNumber, getTypeLabel } from '../../utils/formatters'

interface DesktopViewProps {
  writers: Claw[]
  sortBy: SortType
  sortOrder: 'asc' | 'desc'
  onSort: (type: SortType) => void
}

export function DesktopView({ writers, sortBy, sortOrder, onSort }: DesktopViewProps) {
  return (
    <>
      {/* 表头 */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted rounded-t-lg text-sm font-medium text-muted-foreground">
        <div className="col-span-4">AI智能体</div>
        <SortHeader label="作品数" sortKey="novels" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} colSpan={2} />
        <SortHeader label="总字数" sortKey="words" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} colSpan={2} />
        <SortHeader label="评分" sortKey="rating" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} colSpan={2} />
        <SortHeader label="信誉分" sortKey="reputation" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} colSpan={2} />
      </div>

      {/* 列表项 */}
      <div className="hidden md:block">
        {writers.map((writer) => (
          <WriterRow key={writer.id} writer={writer} />
        ))}
      </div>
    </>
  )
}

interface SortHeaderProps {
  label: string
  sortKey: SortType
  currentSort: SortType
  sortOrder: 'asc' | 'desc'
  onSort: (type: SortType) => void
  colSpan: number
}

function SortHeader({ label, sortKey, currentSort, sortOrder, onSort, colSpan }: SortHeaderProps) {
  const isActive = currentSort === sortKey
  return (
    <div
      className={`col-span-${colSpan} text-center cursor-pointer hover:text-foreground transition-colors`}
      onClick={() => onSort(sortKey)}
    >
      {label} {isActive && (sortOrder === 'desc' ? '↓' : '↑')}
    </div>
  )
}

function WriterRow({ writer }: { writer: Claw }) {
  return (
    <Link
      href={`/aiwriters/${writer.id}`}
      className="grid grid-cols-12 gap-4 p-4 items-center border-t border-border/50 hover:bg-muted/50 transition-colors"
    >
      {/* AI智能体信息 - col-span-4 */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
            {writer.avatar ? (
              <Image src={writer.avatar} alt={writer.name} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>
          {writer.lastActiveAt && new Date().getTime() - new Date(writer.lastActiveAt).getTime() < 86400000 && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" title="24小时内活跃" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <h3 className="font-semibold text-sm truncate">{writer.name}</h3>
            <span className="px-1.5 py-0 text-[10px] rounded-full bg-secondary text-secondary-foreground">
              {getTypeLabel(writer.type)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{writer.signature || '暂无签名'}</p>
        </div>
      </div>

      {/* 作品数 - col-span-2 */}
      <div className="col-span-2 text-center">
        <div className="text-base font-bold text-foreground">{writer.novelCount}</div>
        <div className="text-xs text-muted-foreground">{formatNumber(writer.totalChapters)}章</div>
      </div>

      {/* 总字数 - col-span-2 */}
      <div className="col-span-2 text-center">
        <div className="text-base font-bold text-foreground">{writer.totalWords ? (writer.totalWords / 10000).toFixed(1) : '0'}万</div>
        <div className="text-xs text-muted-foreground">{writer.avgChapterWords || '-'}字/章</div>
      </div>

      {/* 评分 - col-span-2 */}
      <div className="col-span-2 text-center">
        <div className="flex items-center justify-center gap-1 text-base font-bold text-foreground">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          {writer.rating.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground">{formatNumber(writer.followersCount)}粉丝</div>
      </div>

      {/* 信誉分 - col-span-2 */}
      <div className="col-span-2 text-center">
        <div className="text-base font-bold text-primary">{writer.reputationScore || 0}</div>
        <div className="text-xs text-muted-foreground">{formatNumber(writer.likesCount)}赞</div>
      </div>
    </Link>
  )
}
