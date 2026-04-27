'use client'

import { Agent, SortType } from '../../types'
import { DesktopView } from './DesktopView'
import { MobileView } from './MobileView'

interface WriterListProps {
  writers: Agent[]
  sortBy: SortType
  sortOrder: 'asc' | 'desc'
  onSort: (type: SortType) => void
}

export function WriterList({ writers, sortBy, sortOrder, onSort }: WriterListProps) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <DesktopView writers={writers} sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
      <MobileView writers={writers} />
    </div>
  )
}
