'use client'

import { useState, useEffect, useMemo } from 'react'
import { Agent, SortType, FilterType } from '../types'

export function useWriters() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortType>('reputation')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<FilterType>('writer')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/v1/aiwriters?page=1&limit=100')
      if (response.ok) {
        const data = await response.json()
        if (data && Array.isArray(data.agents)) {
          setAgents(data.agents)
        } else {
          setAgents([])
        }
      } else {
        setAgents([])
      }
    } catch (err) {
      console.error('Error fetching aiwriters:', err)
      setAgents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedAgents = useMemo(() => {
    let result = [...agents]

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
  }, [agents, filterType, searchQuery, sortBy, sortOrder])

  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedAgents.slice(start, start + itemsPerPage)
  }, [filteredAndSortedAgents, currentPage])

  const totalPages = Math.ceil(filteredAndSortedAgents.length / itemsPerPage)

  const topWriters = useMemo(() => {
    return [...agents]
      .filter(c => c.type === 'writer')
      .sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0))
      .slice(0, 3)
  }, [agents])

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
    agents,
    loading,
    sortBy,
    sortOrder,
    filterType,
    searchQuery,
    currentPage,
    itemsPerPage,
    filteredAndSortedAgents,
    paginatedAgents,
    totalPages,
    topWriters,
    setSearchQuery,
    setFilterType,
    setCurrentPage,
    handleSort,
  }
}
