"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import { FaYoutube } from "react-icons/fa6"
import type { SeasonListProps } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

const TMDB_URL = "https://image.tmdb.org/t/p/w300"

export interface SeasonListProps {
  series: any
  seasons: any[]
  reactions: any[]
  isLoading?: boolean
}

export default function SeasonList({ series, seasons, reactions, isLoading = false }: SeasonListProps) {
  console.log(series)
  console.log("seasons")
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null)

  // Check if a season has reactions
  const seasonHasReactions = (seasonId: string) => {
    return reactions.some((reaction) => reaction.season_id === seasonId)
  }

  // Get reaction count for a season
  const getSeasonReactionCount = (seasonId: string) => {
    return reactions.filter((reaction) => reaction.season_id === seasonId).length
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-32 mb-6" />

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/20">
              <div className="flex items-center p-4">
                <Skeleton className="h-16 w-12 rounded flex-shrink-0" />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Seasons</h2>

      <div className="space-y-4">
        {seasons.map((season) => (
          <div
            key={season.id}
            className={cn(
              "border border-gray-800 rounded-lg overflow-hidden transition-all duration-300",
              expandedSeason === season.id ? "bg-gray-900/50" : "bg-gray-900/20 hover:bg-gray-900/30",
            )}
          >
            {/* Season Header */}
            <div
              className="flex items-center cursor-pointer p-4"
              onClick={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
            >
              <div className="relative h-16 w-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={
                    season.poster_path
                      ? season.poster_path.startsWith("http")
                        ? season.poster_path
                        : `${TMDB_URL}${season.poster_path}`
                      : "/placeholder.svg?height=240&width=160"
                  }
                  alt={`Season ${season.season_number}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Season {season.season_number}</h3>

                  <div className="flex items-center gap-2">
                    {seasonHasReactions(season.id) && (
                      <Badge className="bg-red-600/20 text-red-400 border-red-500 flex items-center gap-1">
                        <FaYoutube size={10} />
                        <span className="text-xs">{getSeasonReactionCount(season.id)}</span>
                      </Badge>
                    )}

                    <ChevronRight
                      size={18}
                      className={cn(
                        "transition-transform duration-300",
                        expandedSeason === season.id ? "rotate-90" : "",
                      )}
                    />
                  </div>
                </div>

                {season.air_date && (
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <Calendar size={14} className="mr-1" />
                    {formatDate(season.air_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Season Details (Expanded) */}
            {expandedSeason === season.id && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                {season.overview && <p className="text-sm text-gray-300 mb-4">{season.overview}</p>}

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/series/${series.id}/season/${season.season_number}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View Season Details
                    <ChevronRight size={16} />
                  </Link>

                  {seasonHasReactions(season.id) && (
                    <Link
                      href={`/reactions?seasonId=${season.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaYoutube size={16} />
                      View Reactions
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

