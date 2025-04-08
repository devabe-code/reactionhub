"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { get_reaction } from "@/lib/actions/reactions"
import type { BaseContent } from "@/components/HeroSection"
import type { ReactionParams } from "@/lib/types"
import { FaYoutube } from "react-icons/fa6"

export interface CarouselItemProps extends BaseContent {
  type?: "movie" | "series" | "anime" | "episode"
  tmdb_id?: number
  reactionId?: string
  hasReaction?: boolean
  seasonNumber?: number
  episodeNumber?: number
}

interface MovieCarouselProps {
  items?: CarouselItemProps[]
  className?: string
  title?: string
}

export default function MovieCarousel({ items = [], className, title }: MovieCarouselProps) {
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
                <Link href={`/reactions/${reaction.id}`}>
                  <div className="relative group">
                    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md shadow-lg">
                      <Image
                        src={reaction.thumbnail || "/placeholder.svg"}
                        alt={reaction.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Reaction Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-600 text-white border-0 flex items-center gap-1 px-1.5 py-0.5">
                          <FaYoutube size={10} />
                          <span className="text-[10px]">Reaction</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-full text-center bg-black/70 p-1 rounded">
                        <p className="text-sm font-medium truncate">{reaction.title}</p>
                      </div>
                    </div>
                  </div>
                </Link>
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