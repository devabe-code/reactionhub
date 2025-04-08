"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FaYoutube } from "react-icons/fa6"
import type { ReactionListProps } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function ReactionList({ reactions  }: ReactionListProps) {
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const itemsPerPage = 9

  // Filter reactions based on selected filter
  const filteredReactions = reactions.filter((reaction) => {
    if (filter === "all") return true
    if (filter === "episodes" && reaction.episode_id) return true
    if (filter === "seasons" && reaction.season_id && !reaction.episode_id) return true
    return false
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("all")
              setPage(1)
            }}
            className={filter === "all" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            All Reactions
          </Button>

          <Button
            variant={filter === "episodes" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("episodes")
              setPage(1)
            }}
            className={filter === "episodes" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Episodes
          </Button>

          <Button
            variant={filter === "seasons" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("seasons")
              setPage(1)
            }}
            className={filter === "seasons" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Seasons
          </Button>
        </div>
      </div>

      {filteredReactions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReactions.map((reaction) => (
              <div
                key={reaction.id}
                className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
              >
                {/* Thumbnail */}
                <Link href={`/reactions/${reaction.id}`} className="block relative aspect-video group">
                  <Image
                    src={reaction.thumbnail || "/placeholder.svg?height=180&width=320"}
                    alt={reaction.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FaYoutube size={48} className="text-red-500" />
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={
                        reaction.episode_id ? "bg-amber-600" : reaction.season_id ? "bg-green-600" : "bg-purple-600"
                      }
                    >
                      {reaction.episode_id ? "Episode" : reaction.season_id ? "Season" : "Series"}
                    </Badge>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{reaction.title}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-1">{reaction.episode}</p>

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(reaction.createdAt)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/reactions/${reaction.id}`}>
                      <Button size="sm" className="gap-1 bg-red-600 hover:bg-red-700">
                        <FaYoutube size={14} />
                        Watch
                      </Button>
                    </Link>

                    {reaction.first_link && (
                      <Link href={reaction.first_link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1">
                          <ExternalLink size={14} />
                          YouTube
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

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
          <p>No reactions found for the selected filter</p>
        </div>
      )}
    </div>
  )
}

