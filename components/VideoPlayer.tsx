"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Skeleton } from "./ui/skeleton"

interface VideoPlayerProps {
  src: string | null
  poster?: string
  className?: string
}

export default function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  if (!src) {
    return (
      <Skeleton>
        <div className="aspect-video w-full rounded-lg shadow-lg overflow-hidden" /> 
      </Skeleton>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("relative aspect-video w-full rounded-lg shadow-lg overflow-hidden", className)}
    >
      <video
        className="w-full h-full object-cover"
        src={src}
        poster={poster}
        autoPlay={false}
        controls
        preload="auto"
      />
    </motion.div>
  )
}