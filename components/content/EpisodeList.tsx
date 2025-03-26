"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Calendar, Youtube, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import { FaYoutube } from "react-icons/fa6"
import type { EpisodeListProps } from "@/lib/types"

const TMDB_URL = "https://image.tmdb.org/t/p/w300"

export default function EpisodeList({ series, episodes, seasons, reactions }: EpisodeListProps) {
  const [activeSeason, setActiveSeason] = useState(seasons.length > 0 ? seasons[0].season_number : 1)
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null)

  // Filter episodes by season
  const filteredEpisodes = episodes.filter((episode) => {
    const seasonNumber = seasons.find((s) => s.id === episode.season_id)?.season_number
    return seasonNumber === activeSeason
  })

  // Sort episodes by episode number
  const sortedEpisodes = [...filteredEpisodes].sort((a, b) => a.episode_number - b.episode_number)

  // Check if an episode has reactions
  const episodeHasReactions = (episodeId: string) => {
    return reactions.some((reaction) => reaction.episode_id === episodeId)
  }

  // Get reactions for an episode
  const getEpisodeReactions = (episodeId: string) => {
    return reactions.filter((reaction) => reaction.episode_id === episodeId)
  }

  return (
    <div>
      {/* Season Selector */}
      {seasons.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Episodes</h2>

            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Season:</span>
                <div className="relative">
                  <select
                    value={activeSeason}
                    onChange={(e) => setActiveSeason(Number(e.target.value))}
                    className="appearance-none bg-gray-800 border border-gray-700 rounded-md py-1 pl-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {seasons.map((season) => (
                      <option key={season.id} value={season.season_number}>
                        Season {season.season_number}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-800 w-full mb-4"></div>
        </div>
      )}

      {/* Episodes List */}
      {sortedEpisodes.length > 0 ? (
        <div className="space-y-4">
          {sortedEpisodes.map((episode) => (
            <div
              key={episode.id}
              className={cn(
                "border border-gray-800 rounded-lg overflow-hidden transition-all duration-300",
                expandedEpisode === episode.id ? "bg-gray-900/50" : "bg-gray-900/20 hover:bg-gray-900/30",
              )}
            >
              {/* Episode Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center cursor-pointer p-4"
                onClick={() => setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id)}
              >
                <div className="relative h-32 sm:h-24 sm:w-40 rounded overflow-hidden flex-shrink-0 mb-3 sm:mb-0">
                  <Image
                    src={
                      episode.still_path
                        ? episode.still_path.startsWith("http")
                          ? episode.still_path
                          : `${TMDB_URL}${episode.still_path}`
                        : "/placeholder.svg?height=180&width=320"
                    }
                    alt={episode.title || ""}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={32} className="text-white" />
                  </div>

                  {episodeHasReactions(episode.id) && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-600 text-white border-0 flex items-center gap-1 px-1.5 py-0.5">
                        <FaYoutube size={10} />
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="sm:ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{episode.title}</h3>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <span className="mr-3">
                          S{activeSeason} E{episode.episode_number}
                        </span>

                        {episode.air_date && (
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(episode.air_date)}
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronDown
                      size={18}
                      className={cn(
                        "transition-transform duration-300 mt-1",
                        expandedEpisode === episode.id ? "rotate-180" : "",
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Episode Details (Expanded) */}
              {expandedEpisode === episode.id && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-800">
                  {episode.description && <p className="text-sm text-gray-300 mb-4">{episode.description}</p>}

                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" className="gap-2">
                      <Play size={16} className="fill-white" />
                      Watch Now
                    </Button>

                    <Link
                      href={`/series/${series.id}/season/${activeSeason}/episode/${episode.episode_number}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Episode Details
                    </Link>

                    {episodeHasReactions(episode.id) && (
                      <Link
                        href={`/reactions/${getEpisodeReactions(episode.id)[0]?.id || ""}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Youtube size={16} />
                        Watch Reaction
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No episodes found for Season {activeSeason}</p>
        </div>
      )}
    </div>
  )
}

