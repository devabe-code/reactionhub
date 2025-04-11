"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ContentGridProps {
  children: ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function ContentGrid({
  children,
  className,
  columns = 3,
}: ContentGridProps) {
  const getColumnsClass = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 md:grid-cols-2"
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    }
  }

  return (
    <div className={cn("grid gap-6", getColumnsClass(), className)}>
      {children}
    </div>
  )
}
