"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {  Clock, Star, Tv2, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { FaPlay, FaYoutube } from "react-icons/fa6"
import ContentHero from "./ContentHero"
import EpisodeList from "./EpisodeList"
import SeasonList from "./SeasonList"
import ReactionList from "./ReactionList"
import ContentMetadata from "./ContentMetadata"
import type { BaseContent, ContentDetailsProps, ContentType, RelatedContent, Series } from "@/lib/types"
import { VideoCard } from "../ui/video-card"
import { Session } from "next-auth"

const TMDB_URL = "https://image.tmdb.org/t/p/original"

export default function ContentDetails({ type, content, relatedContent, session }: 
                                        { type: ContentType; 
                                          content: BaseContent; 
                                          relatedContent: RelatedContent; 
                                          session: Session }
) {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedDescription, setExpandedDescription] = useState(false)

  // Helper function to parse JSON if needed
  const parseJsonField = (field: unknown) => {
    if (!field) return []
    if (typeof field === "string") {
      try {
        return JSON.parse(field)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        return []
      }
    }
    return field
  }

  // Determine if content has reactions
  const hasReactions = relatedContent.reactions && relatedContent.reactions.length > 0

  // Determine available tabs based on content type
  const availableTabs = ["overview"]
  if (type === "series" || type === "anime") {
    availableTabs.push("seasons")
    if (relatedContent.episodes && relatedContent.episodes.length > 0) {
      availableTabs.push("episodes")
    }
  }
  if (hasReactions && (type === "series" || type === "anime" || type === "movie" || type === "season")) {
    availableTabs.push("reactions")
  }
  if (type === "anime" && relatedContent.animeData) {
    availableTabs.push("anime-details")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <ContentHero type={type} content={content} hasReactions={hasReactions!} relatedContent={relatedContent} />

      {/* Content Body */}
      <div className="container mx-auto px-4 py-8 -mt-10 relative z-10">
        <div className="bg-black/80 backdrop-blur-md rounded-xl border border-gray-800 ">
          {/* Tabs Navigation */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-800 px-4 rounded-xl overflow-x-scroll md:overflow-hidden">
              <TabsList className="bg-transparent h-14">
                {availableTabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 
                              data-[state=active]:border-red-600 px-4 py-3 text-gray-400 
                              hover:text-white transition-colors rounded-xl"
                  >
                    {tab === "overview"
                      ? "Overview"
                      : tab === "seasons"
                        ? "Seasons"
                        : tab === "episodes"
                          ? "Episodes"
                          : tab === "reactions"
                            ? "Reactions"
                            : "Anime Details"}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Poster and Metadata */}
                <div className="md:col-span-1">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-gray-800 mb-6">
                  {(type === "episode") ? (
                    <Image
                      src={`${relatedContent.series?.poster_path?.startsWith('https') 
                            ? (relatedContent.series?.poster_path) : 
                            (TMDB_URL+relatedContent.series?.poster_path)
                            }`}
                      alt={content.title || "Content poster"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                    src={`${content.poster_path?.startsWith('https') 
                          ? (content.poster_path) : 
                          (TMDB_URL+content.poster_path)
                          }`}
                    alt={content.title || "Content poster"}
                    fill
                    className="object-cover"
                  />
                  )}

                    {hasReactions && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-600 text-white border-0 flex items-center gap-1 px-2 py-1">
                          <FaYoutube size={12} />
                          <span className="text-xs">
                            {relatedContent.reactions!.length} Reaction
                            {relatedContent.reactions!.length !== 1 ? "s" : ""}
                          </span>
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <ContentMetadata type={type} content={content} relatedContent={relatedContent} />
                </div>

                {/* Right Column - Description and Details */}
                <div className="md:col-span-2">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title || relatedContent.series?.title || ""}</h1>

                  {/* Subtitle or Original Title */}
                    <h2 className="text-xl text-gray-400 mb-4">
                      {content.original_title || relatedContent.series?.original_title}
                    </h2>

                  {/* Key Info Row */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">

                    {/* Duration/Episodes */}
                    {type === "movie" && content.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-400" />
                        <span>
                          {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                        </span>
                      </div>
                    )}

                      <div className="flex items-center gap-1">
                        <Tv2 size={16} className="text-gray-400" />
                        <span>
                          {content.number_of_seasons || relatedContent.series?.number_of_seasons || 0} Season{content.number_of_seasons !== 1 ? "s" : ""} |{" "}
                          {content.number_of_episodes || relatedContent.series?.number_of_episodes || 0} Episode{content.number_of_episodes !== 1 ? "s" : ""}
                        </span>
                      </div>
                  </div>

                  {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {content.genres && content.genres.map((genre, i) => (
                        <Badge key={i} variant="outline" className="border-gray-700 text-gray-300">
                          <span>{genre}</span>
                        </Badge>
                      ))}
                    </div>

                  {/* Description */}
                  {(content.description || content.overview) && (
                    <div className="mb-8">
                      <div
                        className={cn(
                          "relative text-gray-300 leading-relaxed",
                          !expandedDescription && "max-h-22 overflow-hidden",
                        )}
                      >
                        <p>{content.description || content.overview}</p>

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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 mb-8">

                    {/* Reaction Button - if available */}
                    {hasReactions && (
                      <Link href={`/reactions/${relatedContent.reactions![0].id}`}>
                        <Button
                          variant="default"
                          className="gap-2 bg-red-600/20 border-red-500 text-white hover:bg-red-600/30"
                        >
                          <FaPlay size={18} />
                          Watch Reaction
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Featured Reactions Preview */}
                  {hasReactions && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">Featured Reactions</h3>
                        <Button
                          variant="link"
                          onClick={() => setActiveTab("reactions")}
                          className="text-red-500 hover:text-red-400 p-0"
                        >
                          View All <ChevronRight size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {relatedContent.reactions!.slice(0, 4).map((reaction) => (
                          <VideoCard
                            key={reaction.id}
                            id={reaction.id}
                            title={reaction.title}
                            subtitle={reaction.episode}
                            thumbnail={reaction.thumbnail}
                            date={reaction.createdAt}
                            type="reaction"
                            primaryLink={`/reactions/${reaction.id}`}
                            externalLink={reaction.first_link}
                            showBadge={true}
                            showDate={true}
                            showButtons={true}
                            progress={reaction.progress}
                            duration={reaction.duration}
                            session={session}
                          >

                          </VideoCard>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Seasons Tab */}
            {(type === "series" || type === "anime") && (
              <TabsContent value="seasons" className="p-6">
                <SeasonList
                  series={content as Series}
                  seasons={relatedContent.seasons || []}
                  reactions={relatedContent.reactions || []}
                />
              </TabsContent>
            )}

            {/* Episodes Tab */}
            {(type === "series" || type === "anime") && relatedContent.episodes && (
              <TabsContent value="episodes" className="p-6">
                <EpisodeList
                  series={content as Series}
                  episodes={relatedContent.episodes || []}
                  seasons={relatedContent.seasons || []}
                  reactions={relatedContent.reactions || []}
                />
              </TabsContent>
            )}

            {/* Reactions Tab */}
            {hasReactions && (
              <TabsContent value="reactions" className="p-6">
                <ReactionList reactions={relatedContent.reactions || []} contentType={type} content={content} />
              </TabsContent>
            )}

            {/* Anime Details Tab */}
            {type === "anime" && relatedContent.animeData && (
              <TabsContent value="anime-details" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Anime Information</h2>

                    <div className="space-y-4">
                      {relatedContent.animeData.title_japanese && (
                        <div>
                          <h3 className="text-sm text-gray-400">Japanese Title</h3>
                          <p className="text-lg">{relatedContent.animeData.title_japanese}</p>
                        </div>
                      )}

                      {relatedContent.animeData.status && (
                        <div>
                          <h3 className="text-sm text-gray-400">Status</h3>
                          <p>{relatedContent.animeData.status}</p>
                        </div>
                      )}

                      {relatedContent.animeData.episodes && (
                        <div>
                          <h3 className="text-sm text-gray-400">Episodes</h3>
                          <p>{relatedContent.animeData.episodes}</p>
                        </div>
                      )}

                      {relatedContent.animeData.duration && (
                        <div>
                          <h3 className="text-sm text-gray-400">Episode Duration</h3>
                          <p>{relatedContent.animeData.duration}</p>
                        </div>
                      )}

                      {relatedContent.animeData.rating && (
                        <div>
                          <h3 className="text-sm text-gray-400">Rating</h3>
                          <p>{relatedContent.animeData.rating}</p>
                        </div>
                      )}

                      {relatedContent.animeData.premiered && (
                        <div>
                          <h3 className="text-sm text-gray-400">Premiered</h3>
                          <p>{relatedContent.animeData.premiered}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Statistics</h2>

                    <div className="space-y-4">
                      {relatedContent.animeData.score && (
                        <div>
                          <h3 className="text-sm text-gray-400">Score</h3>
                          <div className="flex items-center gap-2">
                            <Star size={20} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-xl font-bold">{relatedContent.animeData.score / 10}</span>
                            <span className="text-gray-400">
                              ({relatedContent.animeData.scored_by?.toLocaleString()} users)
                            </span>
                          </div>
                        </div>
                      )}

                      {relatedContent.animeData.rank && (
                        <div>
                          <h3 className="text-sm text-gray-400">Rank</h3>
                          <p>#{relatedContent.animeData.rank}</p>
                        </div>
                      )}

                      {relatedContent.animeData.popularity && (
                        <div>
                          <h3 className="text-sm text-gray-400">Popularity</h3>
                          <p>#{relatedContent.animeData.popularity}</p>
                        </div>
                      )}

                      {relatedContent.animeData.members && (
                        <div>
                          <h3 className="text-sm text-gray-400">Members</h3>
                          <p>{relatedContent.animeData.members?.toLocaleString()}</p>
                        </div>
                      )}

                      {relatedContent.animeData.favorites && (
                        <div>
                          <h3 className="text-sm text-gray-400">Favorites</h3>
                          <p>{relatedContent.animeData.favorites?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Studios and Producers */}
                    <div className="mt-8">
                      <h2 className="text-xl font-bold mb-4">Studios & Producers</h2>

                      {parseJsonField(relatedContent.animeData.studios).length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm text-gray-400 mb-2">Studios</h3>
                          <div className="flex flex-wrap gap-2">
                            {parseJsonField(relatedContent.animeData.studios).map((studio: {name: string}, index: number) => (
                              <Badge key={index} className="bg-gray-800 hover:bg-gray-700 text-white">
                                {studio.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {parseJsonField(relatedContent.animeData.producers).length > 0 && (
                        <div>
                          <h3 className="text-sm text-gray-400 mb-2">Producers</h3>
                          <div className="flex flex-wrap gap-2">
                            {parseJsonField(relatedContent.animeData.producers).map((producer: {name: string}, index: number) => (
                              <Badge key={index} variant="outline" className="border-gray-700 text-gray-300">
                                {producer.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}

