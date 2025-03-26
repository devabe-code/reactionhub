"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Calendar, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FaYoutube } from "react-icons/fa6"
import type { ReactionListProps } from "@/lib/types"
import { formatDate } from "@/lib/utils"

export default function ReactionList({ reactions, contentType, content }: ReactionListProps) {
  const [filter, setFilter] = useState("all")

  // Filter reactions based on selected filter
  const filteredReactions = reactions.filter((reaction) => {
    if (filter === "all") return true
    if (filter === "episodes" && reaction.episode_id) return true
    if (filter === "seasons" && reaction.season_id && !reaction.episode_id) return true
    if (filter === "series" && reaction.series_id && !reaction.season_id && !reaction.episode_id) return true
    return false
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Reactions</h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            All Reactions
          </Button>

          <Button
            variant={filter === "episodes" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("episodes")}
            className={filter === "episodes" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Episodes
          </Button>

          <Button
            variant={filter === "seasons" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("seasons")}
            className={filter === "seasons" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Seasons
          </Button>

          <Button
            variant={filter === "series" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("series")}
            className={filter === "series" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Full Series
          </Button>
        </div>
      </div>

      {filteredReactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReactions.map((reaction) => (
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
                      <Youtube size={14} />
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
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No reactions found for the selected filter</p>
        </div>
      )}
    </div>
  )
}

