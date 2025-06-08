"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FaPlay, FaYoutube } from "react-icons/fa6"
import { get_reaction } from "@/lib/actions/reactions"
import type { ReactionParams } from "@/lib/types"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay"
import { Skeleton } from "@/components/ui/skeleton"

// Define base content interface with required fields
export interface BaseContent {
  id: string
  title: string
  image?: string
  [key: string]: string | number | boolean | undefined | null
}

// Define content that can be featured in the hero
export interface FeaturedContent extends BaseContent {
  type?: string
  year?: number
  seasons?: number
  duration?: string
  match?: number
  rating?: string
  description?: string
  hasReaction?: boolean
  reactionId?: string
  reactionThumbnail?: string
}

// Props for the HeroSection component
export interface HeroSectionProps {
  featuredContent?: FeaturedContent[]
  upcomingContent?: BaseContent[]
  title?: string
  className?: string
  isLoading?: boolean
}

const TMDB_URL = "https://image.tmdb.org/t/p/original"

// HeroSlide component to handle individual slides
const HeroSlide = ({ content }: { content: FeaturedContent }) => {
  const [reactionData, setReactionData] = useState<ReactionParams | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageSrc, setImageSrc] = useState("/placeholder.svg?height=1080&width=1920")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const fetchedReaction = await get_reaction(content.id)
        if (fetchedReaction?.reaction) {
          setReactionData(fetchedReaction.reaction)
        } else {
          console.warn(`No reaction found for content ${content.id}`)
        }
      } catch (error) {
        console.error("Error fetching reaction data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [content.id])

  // Determine image source based on screen width
  useEffect(() => {
    const updateImage = () => {
      if (reactionData?.series) {
        if (window.innerWidth < 768) {
          // Mobile: Use poster_path
          setImageSrc(
            reactionData.series.poster_path
              ? `${TMDB_URL + reactionData.series.poster_path}`
              : "/placeholder.svg?height=1080&width=1920"
          )
        } else {
          // Desktop: Use backdrop_path
          setImageSrc(
            reactionData.series.backdrop_path
              ? `${TMDB_URL + reactionData.series.backdrop_path}`
              : "/placeholder.svg?height=1080&width=1920"
          )
        }
      }
    }

    updateImage()
    window.addEventListener("resize", updateImage)
    return () => window.removeEventListener("resize", updateImage)
  }, [reactionData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse w-8 h-8 rounded-full bg-white/20"></div>
      </div>
    )
  }

  if (!reactionData) {
    return null
  }

  return (
    <div className="relative h-[80vh] md:h-[85vh] lg:h-[90vh] overflow-hidden w-full">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={content.title}
        fill
        priority
        className="object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-background via-background/100 to-transparent" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-black/30 rounded-2xl p-4">
            {/* Thumbnail */}
            <div className="relative rounded-md overflow-hidden shadow-2xl border border-white/10 w-full md:w-[560px] aspect-video">
              <Image
                src={reactionData.thumbnail || "/placeholder.svg?height=1080&width=1920"}
                alt={`${reactionData.title} Thumbnail`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <FaYoutube className="text-red-500" size={24} />
                <span className="text-white text-sm font-medium">Full Reaction</span>
              </div>
            </div>

            {/* Content details */}
            <div className="flex-1 md:mt-0">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-red-600/20 text-red-500 border-red-500">
                    <FaYoutube size={12} className="mr-1" /> Reaction Available
                  </Badge>
                </div>

                <h1 className="text-xl text-center md:text-2xl lg:text-3xl font-bold mb-1">{reactionData.title}</h1>
                <h3 className="text-md text-center md:text-xl lg:text-2xl font-medium">
                  {reactionData.anime?.title_english} {reactionData.episode?.episode_number && `Episode ${reactionData.episode.episode_number}`}
                </h3>

                <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                  <span>
                    {reactionData.series?.number_of_seasons
                      ? `${reactionData.series?.number_of_seasons} Seasons`
                      : reactionData.anime?.duration}
                  </span>
                </div>
                <span className="text-center hidden lg:block">
                  {reactionData.series?.description?.slice(0,250)}...
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                  <Link href={`/reactions/${reactionData.id}`}>
                    <Button
                      variant="default"
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <FaPlay size={18} />
                      Watch Reaction
                    </Button>
                  </Link>
                  <Link href={`/series/${reactionData.series?.id}/season/${reactionData.season_number}/episode/${reactionData.episode?.episode_number}`}>
                    <Button variant="outline" className="gap-2">
                      <Info size={18} />
                      More Info
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection({
  featuredContent = [],
  upcomingContent = [],
  className,
  isLoading = false,
}: HeroSectionProps) {
  // Create a ref for the autoplay plugin first, before any conditionals
  const plugin = useRef<AutoplayType>(
    Autoplay({ 
      delay: 10000, 
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  )

  // Handle empty content
  if (featuredContent.length === 0) {
    return null
  }

  if (isLoading) {
    return (
      <div className="relative w-full h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-black via-black/100 to-transparent" />
        
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
    <section
      className={cn(
        "relative w-full h-[80vh] md:h-[85vh] lg:h-[90vh] overflow-hidden",
        className,
      )}
    >
      <Carousel
        opts={{
          loop: true,
          align: "start",
        }}
        plugins={[plugin.current]}
        className="w-full h-full"
      >
        <CarouselContent className="h-full">
          {featuredContent.map((content) => (
            <CarouselItem key={content.id} className="h-full">
              <HeroSlide content={content} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

