"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { get_reaction } from "@/lib/actions/reactions"
import type { BaseContent } from "@/components/HeroSection"
import type { ReactionParams } from "@/lib/types"
import { VideoCard } from "@/components/ui/video-card"
import { Skeleton } from "@/components/ui/skeleton"

export interface CarouselItemProps extends BaseContent {
  id: string;
  title: string;
  image?: string;
  type?: "movie" | "series" | "anime" | "episode";
  tmdb_id?: number;
  reactionId?: string;
  hasReaction?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
  progress?: number;
  duration?: number;
}

interface MovieCarouselProps {
  items?: CarouselItemProps[]
  className?: string
  title?: string
  isLoading?: boolean
}

export default function MovieCarousel({ items = [], className, title, isLoading = false }: MovieCarouselProps) {
  const [carouselData, setCarouselData] = useState<(ReactionParams | null)[]>([])
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  // Update scroll buttons state when the carousel changes
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    api.on("select", onSelect)
    api.on("reInit", onSelect)

    // Initial check
    onSelect()

    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  useEffect(() => {
    if (items.length > 0) {
      // Fetch reaction data for each item
      const fetchReactions = async () => {
        const fetchedData = await Promise.all(
          items.map(async (item) => {
            try {
              const reaction = await get_reaction(item.id)
              return reaction?.reaction || null
            } catch (error) {
              console.error(`Error fetching reaction for ${item.id}:`, error)
              return null
            }
          }),
        )
        setCarouselData(fetchedData)
      }

      fetchReactions()
    }
  }, [items])

  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48" />
          </div>
        )}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-none w-[320px] sm:w-[360px] md:w-[400px]">
                <VideoCard
                  id=""
                  title=""
                  thumbnail=""
                  primaryLink=""
                  isLoading={true}
                />
              </div>
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  // Build an array of unique carousel items (skip duplicates based on reaction.title)
  const uniqueCarouselItems: { reaction: ReactionParams; item: CarouselItemProps }[] = []
  const seenTitles = new Set<string>()
  for (let i = 0; i < carouselData.length; i++) {
    const reaction = carouselData[i]
    const item = items[i]
    if (reaction && !seenTitles.has(reaction.title)) {
      uniqueCarouselItems.push({ reaction, item })
      seenTitles.add(reaction.title)
    }
  }

  return (
    <div className="relative z-50 w-full">
      {title && <h2 className="text-xl font-bold mb-4 px-4">{title}</h2>}

      <div className="relative">
        {/* Left gradient overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />

        <button
          className={cn(
            "absolute left-0 top-0 bottom-0 z-20 w-16 flex items-center justify-center transition-opacity duration-300",
            !canScrollPrev && "opacity-0 pointer-events-none",
          )}
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
          aria-label="Previous items"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <ChevronLeft className="text-white h-8 w-8" />
          </div>
        </button>

        <Carousel
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: true,
          }}
          setApi={setApi}
          className={cn("w-full", className)}
        >
          <CarouselContent className="pb-4 gap-4">
            {uniqueCarouselItems.map(({ reaction, item }) => (
              <CarouselItem
                key={item.id}
                className="pl-4 first:ml-4 last:mr-4 basis-[320px] sm:basis-[360px] md:basis-[400px]"
              >
                <VideoCard
                  id={reaction.id}
                  title={reaction.title}
                  subtitle={reaction.episode?.title}
                  thumbnail={reaction.thumbnail || "/placeholder.svg"}
                  date={new Date(reaction.updatedAt)}
                  type="reaction"
                  primaryLink={`/reactions/${reaction.id}`}
                  externalLink={reaction.second_link}
                  showBadge={true}
                  showDate={true}
                  showButtons={false}
                  progress={item.progress}
                  duration={item.duration}
                  aspectRatio="video"
                  size="md"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Right gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <button
          className={cn(
            "absolute right-0 top-0 bottom-0 z-20 w-16 flex items-center justify-center transition-opacity duration-300",
            !canScrollNext && "opacity-0 pointer-events-none",
          )}
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
          aria-label="Next items"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
            <ChevronRight className="text-white h-8 w-8" />
          </div>
        </button>
      </div>
    </div>
  )
}
