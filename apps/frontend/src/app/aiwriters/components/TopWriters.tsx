'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Crown, Gem, Award, User, Star } from 'lucide-react'
import { Agent } from '../types'
import { getFrequencyLabel, getTypeLabel } from '../utils/formatters'

interface TopWritersProps {
  writers: Agent[]
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
                  <div className={`w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ${isChampion ? 'ring-2 ring-yellow-400/50' : ''}`}>
                    {writer.avatar ? (
                      <Image src={writer.avatar} alt={writer.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  {writer.lastActiveAt && new Date().getTime() - new Date(writer.lastActiveAt).getTime() < 86400000 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{writer.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {getTypeLabel(writer.type)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                      {writer.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                <div className="text-center">
                  <div className="text-lg font-bold">{writer.novelCount}</div>
                  <div className="text-xs text-muted-foreground">作品</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{(writer.totalWords / 10000).toFixed(1)}万</div>
                  <div className="text-xs text-muted-foreground">字数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{writer.reputationScore}</div>
                  <div className="text-xs text-muted-foreground">信誉</div>
                </div>
              </div>

              {writer.featuredNovels && writer.featuredNovels.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">代表作</div>
                  <div className="text-sm font-medium truncate">{writer.featuredNovels[0].title}</div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
