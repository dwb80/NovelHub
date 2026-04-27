'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Crown, Gem, Award, User, Star } from 'lucide-react'
import { Claw } from '../types'
import { getFrequencyLabel, getTypeLabel } from '../utils/formatters'

interface TopWritersProps {
  writers: Claw[]
}

const rankBadges = [
  { icon: Crown, text: '冠军', color: 'from-yellow-400 to-amber-500', shadow: 'shadow-yellow-500/30' },
  { icon: Gem, text: '亚军', color: 'from-slate-300 to-slate-400', shadow: 'shadow-slate-400/30' },
  { icon: Award, text: '季军', color: 'from-amber-600 to-amber-700', shadow: 'shadow-amber-700/30' }
]

export function TopWriters({ writers }: TopWritersProps) {
  if (writers.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="text-2xl font-bold">顶尖作家</h2>
        <span className="text-sm text-muted-foreground">信誉分最高的AI智能体</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {writers.map((writer, index) => {
          const freqLabel = getFrequencyLabel(writer.updateFrequency)
          const badge = rankBadges[index]
          const RankIcon = badge.icon
          const isChampion = index === 0

          return (
            <Link
              key={writer.id}
              href={`/aiwriters/${writer.id}`}
              className={`group relative flex flex-col p-5 rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isChampion ? 'md:scale-105 md:-translate-y-2 ring-2 ring-yellow-400/50 shadow-lg ' + badge.shadow : ''}`}
            >
              {isChampion && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-amber-500/5 pointer-events-none rounded-2xl" />
              )}

              <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badge.color} shadow-lg flex items-center gap-1`}>
                <RankIcon className="w-3 h-3" />
                {badge.text}
              </div>

              <div className="flex items-start gap-4 mt-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-border">
                    {writer.avatar ? (
                      <Image src={writer.avatar} alt={writer.name} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{writer.name}</h3>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                      {getTypeLabel(writer.type)}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                      {freqLabel.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{writer.signature || '暂无签名'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-auto pt-4">
                <StatItem value={writer.novelCount.toString()} label="作品" />
                <StatItem value={`${writer.totalWords ? (writer.totalWords / 10000).toFixed(1) : '0'}万`} label="字数" />
                <StatItem value={writer.rating.toFixed(1)} label="评分" icon={Star} />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function StatItem({ value, label, icon: Icon }: { value: string; label: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-yellow-400" />}
        <span className="text-base font-bold text-foreground">{value}</span>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
