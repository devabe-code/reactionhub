"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FaYoutube } from "react-icons/fa6"
import type { ContentHeroProps } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

const TMDB_URL = "https://image.tmdb.org/t/p/original"

export interface ContentHeroProps {
  type: ContentType
  content: BaseContent
  hasReactions: boolean
  relatedContent: RelatedContent
  isLoading?: boolean
}

export default function ContentHero({ type, content, hasReactions, relatedContent, isLoading = false }: ContentHeroProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Determine the image to use
  const getBackdropImage = () => {
    // For episodes, try to use the still image
    if (type === "episode" && content.still_path) {
      return content.still_path.startsWith("http") ? content.still_path : `${TMDB_URL}${content.still_path}`
    }

    // For seasons, try to use the poster
    if (type === "season" && content.poster_path) {
      return content.poster_path.startsWith("http") ? content.poster_path : `${TMDB_URL}${content.poster_path}`
    }

    // For series or movies, use the backdrop
    if (content.backdrop_path) {
      return content.backdrop_path.startsWith("http") ? content.backdrop_path : `${TMDB_URL}${content.backdrop_path}`
    }

    // If we have a related series, use its backdrop
    if (relatedContent.series && relatedContent.series.backdrop_path) {
      return relatedContent.series.backdrop_path.startsWith("http")
        ? relatedContent.series.backdrop_path
        : `${TMDB_URL}${relatedContent.series.backdrop_path}`
    }

    // Fallback to poster if no backdrop
    if (content.poster_path) {
      return content.poster_path.startsWith("http") ? content.poster_path : `${TMDB_URL}${content.poster_path}`
    }

    // Final fallback
    return "/placeholder.svg?height=1080&width=1920"
  }

  // Get the title to display
  const getTitle = () => {
    if (type === "episode") {
      return `${relatedContent.series?.title || "Unknown Series"} - ${content.title}`
    }

    if (type === "season") {
      return `${relatedContent.series?.title || "Unknown Series"} - Season ${content.season_number}`
    }

    return content.title || "Untitled"
  }

  // Get the subtitle to display
  const getSubtitle = () => {
    if (type === "episode") {
      return `Season ${relatedContent.season?.season_number || "?"}, Episode ${content.episode_number}`
    }

    if (type === "season") {
      return `${content.overview || ""}`
    }

    if (type === "series" || type === "anime") {
      return `${content.number_of_seasons || 0} Season${content.number_of_seasons !== 1 ? "s" : ""}, ${content.number_of_episodes || 0} Episode${content.number_of_episodes !== 1 ? "s" : ""}`
    }

    if (type === "movie" && content.runtime) {
      return `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`
    }

    return ""
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-[70vh] overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        
        {/* Content */}
        <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image src={getBackdropImage() || "/placeholder.svg"} alt={getTitle()} fill priority className="object-cover" />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-16">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            {/* Content Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge
                className={cn(
                  "px-2 py-1 text-xs font-medium",
                  type === "movie"
                    ? "bg-blue-600/20 text-blue-400 border-blue-500"
                    : type === "series"
                      ? "bg-purple-600/20 text-purple-400 border-purple-500"
                      : type === "anime"
                        ? "bg-pink-600/20 text-pink-400 border-pink-500"
                        : type === "season"
                          ? "bg-green-600/20 text-green-400 border-green-500"
                          : "bg-amber-600/20 text-amber-400 border-amber-500",
                )}
              >
                {type === "movie"
                  ? "Movie"
                  : type === "series"
                    ? "TV Series"
                    : type === "anime"
                      ? "Anime"
                      : type === "season"
                        ? "Season"
                        : "Episode"}
              </Badge>

              {hasReactions ? (
                <Badge className="bg-red-600/20 text-red-400 border-red-500 px-2 py-1 text-xs font-medium flex items-center gap-1">
                  <FaYoutube size={12} />
                  Reactions Available
                </Badge>
              ) : 
                <Badge className="bg-gray-600/20 text-white border-white px-2 py-1 text-xs font-medium flex items-center gap-1">
                  <FaYoutube size={12} />
                  No Reaction Yet
                </Badge>
              }
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">{getTitle()}</h1>

          </motion.div>
        </div>
      </div>
    </div>
  )
}

