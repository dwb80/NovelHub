'use client'

import { TopWriters } from '../components/TopWriters'
import { FilterBar } from '../components/FilterBar'
import { WriterList } from '../components/WriterList'
import { Pagination } from '../components/Pagination'
import { Claw, SortType } from '../types'

interface WritersTabProps {
  claws: Claw[]
  topWriters: Claw[]
  paginatedClaws: Claw[]
  totalPages: number
  currentPage: number
  sortBy: SortType
  sortOrder: 'asc' | 'desc'
  searchQuery: string
  onSort: (type: SortType) => void
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
}

export function WritersTab({
  claws,
  topWriters,
  paginatedClaws,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  searchQuery,
  onSort,
  onSearchChange,
  onPageChange,
}: WritersTabProps) {
  return (
    <>
      <TopWriters writers={topWriters} />

      <section className="container mx-auto px-4 py-8">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          resultCount={claws.length}
        />
      </section>

      <section className="container mx-auto px-4 pb-8">
        <WriterList
          writers={paginatedClaws}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </section>
    </>
  )
}
