"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FaPlay, FaYoutube } from "react-icons/fa6"
import { get_reaction } from "@/lib/actions/reactions"
import type { ReactionParams } from "@/lib/types"

// Define base content interface with required fields
export interface BaseContent {
  id: string
  title: string
  image?: string
  [key: string]: any // Allow any additional fields
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
}

// HeroSlide component to handle individual slides
const HeroSlide = ({
  content,
  isActive,
  isDragging,
  dragDelta,
  TMDB_URL,
}: {
  content: FeaturedContent
  isActive: boolean
  isDragging: boolean
  dragDelta: number
  TMDB_URL: string
}) => {
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
  }, [reactionData, TMDB_URL])

  if (isLoading) {
    return (
      <div
        className={cn(
          "absolute inset-0 w-full h-full flex items-center justify-center",
          isActive ? "opacity-100 z-10" : "opacity-0 z-0"
        )}
      >
        <div className="animate-pulse w-8 h-8 rounded-full bg-white/20"></div>
      </div>
    )
  }

  if (!reactionData) {
    return null
  }

  console.log(imageSrc)

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full transition-opacity duration-500 flex justify-center items-center ",
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      )}
    >
      {/* Dynamically selected image */}
      <Image
        src={imageSrc}
        alt={content.title}
        fill
        priority={isActive}
        className="object-cover"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8 items-center bg-black/30 rounded-2xl p-4">
            {/* Thumbnail with styling */}
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
                <span className="text-white text-sm font-medium">Reaction</span>
              </div>
            </div>

            {/* Content details */}
            <div className="flex-1 md:mt-0">
              <div className="flex flex-col items-center">
                {/* Content Type Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-red-600/20 text-red-500 border-red-500">
                    <FaYoutube size={12} className="mr-1" /> Reaction Available
                  </Badge>
                </div>

                <h1 className="text-xl text-center md:text-2xl lg:text-3xl font-bold mb-1">{reactionData.title}</h1>
                <h3 className="text-md text-center md:text-xl lg:text-2xl font-medium">
                  {reactionData.anime?.title_english} Episode {reactionData.episode?.episode_number}
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

                <div className="flex flex-col items-center gap-3">
                  <Link href={`/reactions/${reactionData.id}`}>
                    <Button
                      variant="default"
                      color="red"
                      className="gap-2"
                    >
                      <FaPlay size={18} />
                      Watch Reaction
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2">
                    <Info size={18} />
                    More Info
                  </Button>
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
  title = "Coming This Week",
  className,
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const TMDB_URL = "https://image.tmdb.org/t/p/original"

  // Handle empty content
  if (featuredContent.length === 0) {
    return null
  }

  // Function to go to next slide
  const goToNextSlideBase = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredContent.length)
  }

  const goToPrevSlideBase = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? featuredContent.length - 1 : prevIndex - 1))
  }

  const goToNextSlide = useCallback(() => {
    setIsTransitioning(true)
    goToNextSlideBase()

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }, [goToNextSlideBase])

  // Function to go to previous slide
  const goToPrevSlide = useCallback(() => {
    setIsTransitioning(true)
    goToPrevSlideBase()

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }, [goToPrevSlideBase])

  // Setup autoplay
  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current)
    }

    autoplayTimerRef.current = setTimeout(() => {
      goToNextSlide()
    }, 8000)
  }, [goToNextSlide])

  const stopAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current)
      autoplayTimerRef.current = null
    }
  }, [])

  // Handle autoplay
  useEffect(() => {
    startAutoplay()

    return () => {
      stopAutoplay()
    }
  }, [currentIndex, startAutoplay, stopAutoplay])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        stopAutoplay()
        goToPrevSlide()
        startAutoplay()
      } else if (e.key === "ArrowRight") {
        stopAutoplay()
        goToNextSlide()
        startAutoplay()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNextSlide, goToPrevSlide, startAutoplay, stopAutoplay])

  // Handle drag functionality
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      stopAutoplay()
      setIsDragging(true)

      // Get the starting position
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX

      setDragStartX(clientX)
      setDragDelta(0)
    },
    [stopAutoplay],
  )

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative w-full h-[80vh] md:h-[85vh] lg:h-[90vh] overflow-hidden",
        className,
      )}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      {/* Background Images */}
      {featuredContent.map((content, index) => (
        <HeroSlide
          key={content.id}
          content={content}
          isActive={currentIndex === index}
          isDragging={isDragging}
          dragDelta={dragDelta}
          TMDB_URL={TMDB_URL}
        />
      ))}

      {/* Indicators */}
      {featuredContent.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center gap-2">
          {featuredContent.map((_, i) => (
            <Button
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                currentIndex === i ? "w-6 bg-white" : "w-2 bg-white/50",
              )}
              onClick={() => {
                stopAutoplay()
                setIsTransitioning(true)
                setCurrentIndex(i)
                setTimeout(() => {
                  setIsTransitioning(false)
                }, 500)
                startAutoplay()
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

