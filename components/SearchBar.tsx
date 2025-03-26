"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Play } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"
import { motion, AnimatePresence } from "framer-motion"

type SearchResult = {
  id: string
  title: string
  poster_path?: string | null
  type: "movie" | "series" | "anime" | "episode" | "season"
  year?: string | null
  parent_title?: string | null
  season_number?: number | null
  episode_number?: number | null
  series_id?: string | null
  season_id?: string | null
}

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSearchTerm = useDebounce(searchQuery, 300)

  // Close search when clicking outside
  useOnClickOutside(searchRef, () => {
    if (isExpanded) {
      setIsExpanded(false)
      setSearchQuery("")
      setResults([])
    }
  })

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Fetch search results when debounced search term changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`)
        if (!response.ok) throw new Error("Search failed")
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedSearchTerm])

  const toggleSearch = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      // Reset search when opening
      setSearchQuery("")
      setResults([])
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    inputRef.current?.focus()
  }

  // Group results by type for better organization
  const groupedResults = results.reduce((acc, result) => {
    const type = result.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  // Order of result types to display
  const resultOrder = ["movie", "series", "anime", "season", "episode"]

  return (
    <div ref={searchRef} className="relative z-50">
      <div className="flex items-center">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "270px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              // Changed to absolute positioning so the search bar overlays header items
              className="absolute right-0 top-1/2 transform -translate-y-1/2 sm:w-[3end00px] overflow-hidden"
            >
              <div className="flex items-center w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, episodes..."
                  className="h-10 w-full bg-black/20 backdrop-blur-md border-0 rounded-l-md px-3 py-2 text-white placeholder:text-gray-400 focus:outline-none"
                />
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 rounded-none bg-black/20 backdrop-blur-md text-white hover:bg-black/30"
                      onClick={clearSearch}
                    >
                      <X size={18} />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            className={cn(
              "h-10 text-white",
              isExpanded ? "rounded-l-none bg-black/20 backdrop-blur-md" : "rounded-md"
            )}
          >
            <Search size={20} />
            <span className="sr-only">Search</span>
          </Button>
        </motion.div>
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {isExpanded && (searchQuery.length > 1 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            // Adjusted to align with the search input
            className="absolute right-0 mt-1 w-[270px] md:w-[450px] max-h-[70vh] overflow-y-auto rounded-md bg-black/90 backdrop-blur-lg shadow-lg border border-gray-800"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block mr-2"
                >
                  <Search size={16} />
                </motion.div>
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {resultOrder.map(type => {
                  if (!groupedResults[type] || groupedResults[type].length === 0) return null;
                  
                  return (
                    <div key={type} className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                        {type === "movie" ? "Movies" : 
                         type === "series" ? "TV Shows" : 
                         type === "anime" ? "Anime" : 
                         type === "season" ? "Seasons" : 
                         "Episodes"}
                      </div>
                      <ul>
                        {groupedResults[type].map((result, index) => (
                          <motion.li 
                            key={`${result.type}-${result.id}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            className="px-1"
                          >
                            <Link
                              href={
                                result.type === "episode" 
                                  ? `/series/${result.series_id}/season/${result.season_number}/episode/${result.episode_number}` 
                                : result.type === "season"
                                  ? `/series/${result.series_id}/season/${result.season_number}`
                                  : `/${result.type}/${result.id}`
                              }
                              className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-md transition-colors"
                              onClick={() => setIsExpanded(false)}
                            >
                              <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-sm">
                                <Image
                                  src={
                                    result.poster_path
                                      ? result.poster_path.startsWith('http')
                                        ? result.poster_path
                                        : `https://image.tmdb.org/t/p/w92${result.poster_path}`
                                      : "https://placehold.co/120x72"
                                  }
                                  alt={result.title}
                                  fill
                                  className="object-cover"
                                />
                                {(result.type === "episode" || result.type === "season") && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Play size={24} className="text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">{result.title}</span>
                                <div className="flex items-center gap-2">
                                  {result.parent_title && (
                                    <span className="text-xs text-gray-400">{result.parent_title}</span>
                                  )}
                                  {result.type === "episode" && result.season_number !== undefined && result.episode_number !== undefined && (
                                    <span className="text-xs text-gray-400">S{result.season_number} E{result.episode_number}</span>
                                  )}
                                  {result.type === "season" && result.season_number !== undefined && (
                                    <span className="text-xs text-gray-400">Season {result.season_number}</span>
                                  )}
                                  {result.year && <span className="text-xs text-gray-400">{result.year}</span>}
                                </div>
                              </div>
                            </Link>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : searchQuery.length > 1 ? (
              <div className="p-4 text-center text-gray-400">No results found</div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
