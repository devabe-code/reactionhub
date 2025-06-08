"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Calendar, Play, PlayCircleIcon, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

export interface VideoCardProps {
  id: string
  title: string
  subtitle?: string
  thumbnail: string
  date?: Date
  type?: "episode" | "season" | "series" | "reaction"
  primaryLink: string
  externalLink?: string
  externalLinkLabel?: string
  className?: string
  aspectRatio?: "video" | "square" | "portrait"
  size?: "sm" | "md" | "lg"
  showBadge?: boolean
  showDate?: boolean
  showButtons?: boolean
  customBadgeColor?: string
  customBadgeText?: string
  customPrimaryButtonText?: string
  customPrimaryButtonIcon?: React.ReactNode
  progress?: number
  duration?: number
}

export function VideoCard({
  id,
  title,
  subtitle,
  thumbnail,
  date,
  type = "reaction",
  primaryLink,
  externalLink,
  externalLinkLabel = "YouTube",
  className,
  aspectRatio = "video",
  size = "md",
  showBadge = true,
  showDate = true,
  showButtons = true,
  customBadgeColor,
  customBadgeText,
  customPrimaryButtonText,
  customPrimaryButtonIcon,
  progress,
  duration
}: VideoCardProps) {
  const progressPercentage = duration && progress 
    ? Math.min(Math.round((progress / duration) * 100), 100)
    : 0

  // Determine aspect ratio class
  const aspectRatioClass = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[2/3]",
  }[aspectRatio]

  // Determine badge color based on type
  const getBadgeColor = () => {
    if (customBadgeColor) return customBadgeColor
    
    switch (type) {
      case "episode":
        return "bg-amber-600"
      case "season":
        return "bg-green-600"
      case "series":
        return "bg-purple-600"
      default:
        return "bg-red-600"
    }
  }

  // Determine badge text based on type
  const getBadgeText = () => {
    if (customBadgeText) return customBadgeText
    
    switch (type) {
      case "episode":
        return "Episode"
      case "season":
        return "Season"
      case "series":
        return "Series"
      default:
        return "Reaction"
    }
  }

  // Determine primary button icon
  const getPrimaryButtonIcon = () => {
    if (customPrimaryButtonIcon) return customPrimaryButtonIcon
    
    switch (type) {
      case "episode":
        return <Play size={14} />
      default:
        return <PlayCircle size={14} />
    }
  }

  // Determine primary button text
  const getPrimaryButtonText = () => {
    if (customPrimaryButtonText) return customPrimaryButtonText
    
    switch (type) {
      case "episode":
        return "Watch"
      default:
        return "Watch"
    }
  }

  // Determine card size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm"
      case "lg":
        return "text-lg"
      default:
        return ""
    }
  }

  return (
    <div
      className={cn(
        "bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors relative",
        getSizeClasses(),
        className
      )}
    >
      {/* Thumbnail */}
      <Link href={primaryLink} className={cn("block relative group", aspectRatioClass)}>
        <Image
          src={thumbnail || "/placeholder.svg?height=180&width=320"}
          alt={title}
          fill
          className="object-cover group-hover:scale-100 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <PlayCircleIcon size={48} className="text-white" />
        </div>

        {/* Type Badge */}
        {showBadge && (
          <div className="absolute top-2 right-2">
            <Badge className={getBadgeColor()}>
              {getBadgeText()}
            </Badge>
          </div>
        )}

        {/* Progress bar */}
        {progress !== undefined && duration && progressPercentage > 0 && progressPercentage < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-red-600"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400 mb-3 line-clamp-1">{subtitle}</p>}

        {showDate && date && (
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <Calendar size={14} className="mr-1" />
            {formatDate(date)}
          </div>
        )}

        {showButtons && (
          <div className="flex flex-wrap gap-2">
            <Link href={primaryLink}>
              <Button size="sm" className="gap-1 bg-red-600 hover:bg-red-700 text-white">
                {getPrimaryButtonIcon()}
                {getPrimaryButtonText()}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
