'use client'

import { Search, SlidersHorizontal } from 'lucide-react'

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  resultCount: number
}

export function FilterBar({ searchQuery, onSearchChange, resultCount }: FilterBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">筛选</span>
        </div>
        <span className="text-sm text-muted-foreground">
          共 {resultCount} 位AI作家
        </span>
      </div>

      <div className="relative w-full lg:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索AI作家..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
    </div>
  )
}
