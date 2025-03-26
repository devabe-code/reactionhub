"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, ChevronLeft, ExternalLink, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import { FaYoutube } from "react-icons/fa6"
import type { ReactionDetailsProps } from "@/lib/types"

export default function ReactionDetails({ reaction, relatedContent }: ReactionDetailsProps) {
  const [activeVideo, setActiveVideo] = useState(reaction.first_link || "")

  // Helper function to extract YouTube video ID
  const getYoutubeId = (url?: string) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Get YouTube IDs
  const firstVideoId = getYoutubeId(reaction.first_link)
  const secondVideoId = getYoutubeId(reaction.second_link)

  // Get content type and title
  const getContentInfo = () => {
    if (relatedContent.episode) {
      return {
        type: "episode",
        title: relatedContent.episode.title || "",
        link: `/series/${reaction.series_id}/season/${reaction.season_number}/episode/${relatedContent.episode.episode_number}`,
        fullTitle: `${relatedContent.series?.title} - S${reaction.season_number}E${relatedContent.episode.episode_number} - ${relatedContent.episode.title}`,
      }
    }

    if (relatedContent.season) {
      return {
        type: "season",
        title: `Season ${reaction.season_number}`,
        link: `/series/${reaction.series_id}/season/${reaction.season_number}`,
        fullTitle: `${relatedContent.series?.title} - Season ${reaction.season_number}`,
      }
    }

    if (relatedContent.series) {
      return {
        type: "series",
        title: relatedContent.series.title || "",
        link: `/series/${reaction.series_id}`,
        fullTitle: relatedContent.series.title || "",
      }
    }

    return {
      type: "unknown",
      title: reaction.title,
      link: "#",
      fullTitle: reaction.title,
    }
  }

  const contentInfo = getContentInfo()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative w-full bg-black">
        {/* YouTube Embed */}
        <div className="relative pt-[56.25%] w-full">
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo)}?autoplay=0&rel=0`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Content Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Reaction Info */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <Link href={`/${contentInfo.type}s`} className="hover:text-white transition-colors">
                {contentInfo.type === "episode"
                  ? "Episodes"
                  : contentInfo.type === "season"
                    ? "Seasons"
                    : contentInfo.type === "series"
                      ? "Series"
                      : "Content"}
              </Link>
              <ChevronLeft size={16} className="mx-1 rotate-180" />
              <Link href={contentInfo.link} className="hover:text-white transition-colors">
                {contentInfo.title}
              </Link>
              <ChevronLeft size={16} className="mx-1 rotate-180" />
              <span className="text-white">Reaction</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{reaction.title}</h1>

            {/* Subtitle */}
            <h2 className="text-xl text-gray-400 mb-4">{reaction.episode}</h2>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={16} className="text-gray-400" />
                <span>{formatDate(reaction.createdAt)}</span>
              </div>

              <Badge
                className={
                  contentInfo.type === "episode"
                    ? "bg-amber-600"
                    : contentInfo.type === "season"
                      ? "bg-green-600"
                      : "bg-purple-600"
                }
              >
                {contentInfo.type === "episode"
                  ? "Episode Reaction"
                  : contentInfo.type === "season"
                    ? "Season Reaction"
                    : "Series Reaction"}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              {reaction.first_link && reaction.second_link && (
                <>
                  <Button
                    variant={activeVideo === reaction.first_link ? "default" : "outline"}
                    className={cn("gap-2", activeVideo === reaction.first_link ? "bg-red-600 hover:bg-red-700" : "")}
                    onClick={() => setActiveVideo(reaction.first_link || "")}
                  >
                    <FaYoutube size={18} />
                    Part 1
                  </Button>

                  <Button
                    variant={activeVideo === reaction.second_link ? "default" : "outline"}
                    className={cn("gap-2", activeVideo === reaction.second_link ? "bg-red-600 hover:bg-red-700" : "")}
                    onClick={() => setActiveVideo(reaction.second_link || "")}
                  >
                    <FaYoutube size={18} />
                    Part 2
                  </Button>
                </>
              )}

              <Button variant="outline" className="gap-2">
                <Share2 size={18} />
                Share
              </Button>

              <Link href={activeVideo} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink size={18} />
                  Watch on YouTube
                </Button>
              </Link>
            </div>

            {/* Content Link */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-medium mb-2">Watch the Original Content</h3>
              <p className="text-gray-400 mb-3">This is a reaction to {contentInfo.fullTitle}</p>
              <Link href={contentInfo.link}>
                <Button className="gap-2">
                  View{" "}
                  {contentInfo.type === "episode" ? "Episode" : contentInfo.type === "season" ? "Season" : "Series"}{" "}
                  Details
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Related Reactions */}
          <div>
            <h3 className="text-xl font-bold mb-4">More Reactions</h3>

            {relatedContent.otherReactions && relatedContent.otherReactions.length > 0 ? (
              <div className="space-y-4">
                {relatedContent.otherReactions.slice(0, 5).map((otherReaction) => (
                  <Link key={otherReaction.id} href={`/reactions/${otherReaction.id}`} className="flex gap-3 group">
                    <div className="relative h-20 w-32 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={otherReaction.thumbnail || "/placeholder.svg?height=120&width=200"}
                        alt={otherReaction.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaYoutube size={24} className="text-red-500" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2 group-hover:text-red-400 transition-colors">
                        {otherReaction.title}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-1">{otherReaction.episode}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No other reactions found.</p>
            )}

            {relatedContent.otherReactions && relatedContent.otherReactions.length > 5 && (
              <Link href={`/reactions?seriesId=${reaction.series_id}`}>
                <Button variant="link" className="mt-4 text-red-400 hover:text-red-300 p-0">
                  View All Reactions
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

