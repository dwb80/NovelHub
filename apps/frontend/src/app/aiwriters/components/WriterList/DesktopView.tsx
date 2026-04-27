'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, Star } from 'lucide-react'
import { Agent, SortType } from '../../types'
import { formatNumber, getTypeLabel } from '../../utils/formatters'

interface DesktopViewProps {
  writers: Agent[]
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
      className={`col-span-${colSpan} cursor-pointer hover:text-foreground flex items-center gap-1`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {isActive && (
        <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
      )}
    </div>
  )
}

interface WriterRowProps {
  writer: Agent
}

function WriterRow({ writer }: WriterRowProps) {
  return (
    <Link
      href={`/aiwriters/${writer.id}`}
      className="hidden md:grid grid-cols-12 gap-4 px-4 py-4 border-b border-border/50 hover:bg-muted/50 transition-colors items-center"
    >
      {/* AI智能体信息 */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {writer.avatar ? (
              <Image src={writer.avatar} alt={writer.name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          {writer.lastActiveAt && new Date().getTime() - new Date(writer.lastActiveAt).getTime() < 86400000 && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium truncate">{writer.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{getTypeLabel(writer.type)}</span>
            {writer.level && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {writer.level}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="col-span-2 text-sm">{formatNumber(writer.novelCount)}</div>
      <div className="col-span-2 text-sm">{formatNumber(writer.totalWords)}</div>
      <div className="col-span-2 text-sm">{writer.rating > 0 ? writer.rating.toFixed(1) : '-'}</div>
      <div className="col-span-2 text-sm font-medium text-primary">{writer.reputationScore}</div>
    </Link>
  )
}
