"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, ChevronDown, ChevronUp, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import { FaGoogleDrive, FaYoutube } from "react-icons/fa6"
import type { ReactionDetailsProps, ReactionParams } from "@/lib/types"
import VideoPlayer from "@/components/VideoPlayer"
import { Session } from "next-auth"

export default function ReactionDetails({ reaction, relatedContent, session }: 
                                        { reaction: ReactionParams; 
                                          relatedContent: ReactionDetailsProps["relatedContent"]; 
                                          session: Session }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [expandedDescription, setExpandedDescription] = useState(false)

  // Load Streamable video (if available)
  const loadVideo = async (videoUrl: string) => {
    if (videoUrl.includes("streamable.com")) {
      const segments = videoUrl.split("/")
      const videoId = segments[segments.length - 1]
      try {
        const res = await fetch(`https://api.streamable.com/videos/${videoId}`)
        const data = await res.json()
        if (data?.files?.mp4?.url) {
          setActiveVideo(data.files.mp4.url)
          return
        }
      } catch (error) {
        console.error("Error fetching Streamable video:", error)
      }
    }

    setActiveVideo(videoUrl.trim() ? videoUrl : null)
  }

  useEffect(() => {
    if (reaction.first_link) {
      loadVideo(reaction.first_link)
    }
  }, [reaction.first_link])

  const getContentInfo = () => {
    if (relatedContent.episode) {
      return {
        type: "episode",
        title: relatedContent.episode.title || "",
        link: `/series/${reaction}/season/${reaction.season_number}/episode/${relatedContent.episode.episode_number}`,
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
    <div className=" bg-black text-white">
      {/* Hero Section */}
          <div className="max-w-6xl mx-auto">
            <VideoPlayer
              src={activeVideo}
              poster={reaction.thumbnail || "/placeholder.svg?height=720&width=1280"} 
              reactionId={reaction.id}
              session={session}
            />
          </div>

      {/* Content Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{reaction.title}</h1>
              <h2 className="text-xl text-gray-400 mb-4 hover:underline hover:text-white">
              <Link href={`/series/${relatedContent.series?.id}/season/${reaction.season_number}/episode/${relatedContent.episode?.episode_number}`}>
                <span className="text-white">
                  {relatedContent.series?.title} : {relatedContent.episode?.title}
                </span>
                </Link>
              </h2>
                  {/* Description */}
                  {(relatedContent.episode?.description || relatedContent.series?.overview) && (
                    <div className="mb-8">
                      <div
                        className={cn(
                          "relative text-gray-300 leading-relaxed",
                          !expandedDescription && "max-h-22 overflow-hidden",
                        )}
                      >
                        <p>{relatedContent.episode?.description || relatedContent.series?.overview}</p>

                        {!expandedDescription && (
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedDescription(!expandedDescription)}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mt-2 transition-colors"
                      >
                        {expandedDescription ? (
                          <>
                            <ChevronUp size={16} />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            Show More
                          </>
                        )}
                      </button>
                    </div>
                  )}
            {/* Meta */}
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

            <div className="flex flex-wrap gap-4 mb-8">
              {activeVideo && (
                  <Link href={activeVideo} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                      <Download size={18} />
                      Download
                    </Button>
                  </Link>
                )}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {reaction.second_link && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    window.open(reaction.second_link, "_blank", "noopener,noreferrer")
                  }}
                >
                  <FaGoogleDrive size={18} />
                  Google Drive
                </Button>
              )}

              <Button variant="outline" className="gap-2">
                <Share2 size={18} />
                Share
              </Button>
            </div>
          </div>

          {/* More Reactions */}
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
                        sizes="(max-width: 768px) 100vw, 33vw"
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
              <Link href={`/series/${reaction.series_id}/season/${reaction.season_number}`}>
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

