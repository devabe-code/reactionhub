import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date?: Date | string | null) => {
  if (!date) return "Unknown"

  const parsed = typeof date === "string" ? new Date(date) : date

  if (isNaN(parsed.getTime())) return "Invalid date"

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function normalizeNulls<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj }

  for (const key in result) {
    if (result[key] === null) {
      (result as any)[key] = undefined
    }
  }

  return result
}

export function mapReactionToFeaturedContent(reaction: any) {
  return {
    id: reaction.id,
    title: reaction.title,
    subtitle: reaction.episode || reaction.season_title,
    thumbnail: reaction.thumbnail,
    type: reaction.episode_id ? "episode" : reaction.season_id ? "season" : "reaction",
    primaryLink: `/reactions/${reaction.id}`,
    externalLink: reaction.first_link,
    progress: reaction.progress,
    duration: reaction.duration
  };
}
