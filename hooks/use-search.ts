"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "./use-debounce"

interface UseSearchOptions<T> {
  items: T[]
  searchFields: (keyof T)[]
  debounceMs?: number
}

export function useSearch<T>({ 
  items, 
  searchFields,
  debounceMs = 300 
}: UseSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)
  
  // Reset to first page when search query changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery])
  
  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    if (!debouncedSearchQuery) return true
    
    const query = debouncedSearchQuery.toLowerCase()
    
    return searchFields.some((field) => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(query)
      }
      return false
    })
  })
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
  }
  
  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filteredItems,
    clearSearch,
    page,
    setPage
  }
}
