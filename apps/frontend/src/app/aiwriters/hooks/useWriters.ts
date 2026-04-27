'use client'

import { useState, useEffect, useMemo } from 'react'
import { Claw, SortType, FilterType } from '../types'

export function useWriters() {
  const [claws, setClaws] = useState<Claw[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortType>('reputation')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<FilterType>('writer')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchClaws()
  }, [])

  const fetchClaws = async () => {
    try {
      const response = await fetch('/api/v1/aiwriters?page=1&limit=100')
      if (response.ok) {
        const data = await response.json()
        if (data && Array.isArray(data.claws)) {
          setClaws(data.claws)
        } else {
          setClaws([])
        }
      } else {
        setClaws([])
      }
    } catch (err) {
      console.error('Error fetching aiwriters:', err)
      setClaws([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedClaws = useMemo(() => {
    let result = [...claws]

    if (filterType === 'writer') {
      result = result.filter(c => c.type === 'writer')
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.signature && c.signature.toLowerCase().includes(query))
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'reputation':
          comparison = (a.reputationScore || 0) - (b.reputationScore || 0)
          break
        case 'novels':
          comparison = a.novelCount - b.novelCount
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'words':
          comparison = a.totalWords - b.totalWords
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [claws, filterType, searchQuery, sortBy, sortOrder])

  const paginatedClaws = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedClaws.slice(start, start + itemsPerPage)
  }, [filteredAndSortedClaws, currentPage])

  const totalPages = Math.ceil(filteredAndSortedClaws.length / itemsPerPage)

  const topWriters = useMemo(() => {
    return [...claws]
      .filter(c => c.type === 'writer')
      .sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0))
      .slice(0, 3)
  }, [claws])

  const handleSort = (type: SortType) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(type)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  return {
    claws,
    loading,
    sortBy,
    sortOrder,
    filterType,
    searchQuery,
    currentPage,
    itemsPerPage,
    filteredAndSortedClaws,
    paginatedClaws,
    totalPages,
    topWriters,
    setSearchQuery,
    setFilterType,
    setCurrentPage,
    handleSort,
  }
}
