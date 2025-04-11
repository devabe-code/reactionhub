"use client"

import { Search, X } from "lucide-react"
import type { ReactionListProps } from "@/lib/types"
import { VideoCard } from "@/components/ui/video-card"
import { ContentGrid } from "@/components/ui/content-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/hooks/use-search"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function ReactionList({ reactions }: ReactionListProps) {
  const itemsPerPage = 9

  // Use our search hook
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filteredItems: filteredReactions,
    clearSearch,
    page,
    setPage
  } = useSearch({
    items: reactions,
    searchFields: ['title', 'episode']
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredReactions.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const paginatedReactions = filteredReactions.slice(startIndex, startIndex + itemsPerPage)

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Reactions</h2>

        {/* Search input */}
        <div className="relative w-full sm:w-64 md:w-72">
          <div className="flex items-center">
            <div className="relative w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reactions..."
                className="pr-10 bg-gray-900/50 border-gray-700 focus-visible:ring-gray-500"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full aspect-square text-gray-400 hover:text-white"
                  onClick={clearSearch}
                >
                  <X size={16} />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
              {!searchQuery && <Search size={16} />}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      {debouncedSearchQuery && (
        <div className="mb-4 text-sm text-gray-400">
          Found {filteredReactions.length} {filteredReactions.length === 1 ? 'result' : 'results'} for "{debouncedSearchQuery}"
        </div>
      )}

      {filteredReactions.length > 0 ? (
        <>
          <ContentGrid>
            {paginatedReactions.map((reaction) => (
              <VideoCard
                key={reaction.id}
                id={reaction.id}
                title={reaction.title}
                subtitle={reaction.episode}
                thumbnail={reaction.thumbnail}
                date={reaction.createdAt}
                type={reaction.episode_id ? "episode" : reaction.season_id ? "season" : "series"}
                primaryLink={`/reactions/${reaction.id}`}
                externalLink={reaction.first_link}
                showBadge={true}
                showDate={true}
                showButtons={true}
                progress={reaction.progress}
                duration={reaction.duration}
              />
            ))}
          </ContentGrid>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(page - 1)}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first page, last page, current page, and pages around current
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (page <= 3) {
                        // Near start: show first 3, ellipsis, last
                        if (i < 3) {
                          pageNum = i + 1;
                        } else if (i === 3) {
                          return (
                            <PaginationItem key="ellipsis-1">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          pageNum = totalPages;
                        }
                      } else if (page >= totalPages - 2) {
                        // Near end: show first, ellipsis, last 3
                        if (i === 0) {
                          pageNum = 1;
                        } else if (i === 1) {
                          return (
                            <PaginationItem key="ellipsis-2">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          pageNum = totalPages - (4 - i);
                        }
                      } else {
                        // Middle: show first, ellipsis, current-1, current, current+1, ellipsis, last
                        if (i === 0) {
                          pageNum = 1;
                        } else if (i === 1) {
                          return (
                            <PaginationItem key="ellipsis-3">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else if (i === 2) {
                          pageNum = page;
                        } else if (i === 3) {
                          return (
                            <PaginationItem key="ellipsis-4">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          pageNum = totalPages;
                        }
                      }
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={page === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={page === pageNum ? "bg-red-600 hover:bg-red-700" : "cursor-pointer"}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(page + 1)}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          {debouncedSearchQuery ? (
            <>
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No reactions found matching "{debouncedSearchQuery}"</p>
              <p className="mt-2">Try a different search term</p>
            </>
          ) : (
            <p>No reactions available</p>
          )}
        </div>
      )}
    </div>
  )
}

