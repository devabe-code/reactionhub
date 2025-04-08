import { notFound } from "next/navigation"
import { db } from "@/database/drizzle"
import { reactions, series, seasons, episodes } from "@/database/schema"
import { eq, and } from "drizzle-orm"
import ReactionDetails from "@/components/content/ReactionDetails"

type ReactionParams = {
  params: {
    id: string
  }
}

export default async function ReactionPage({ params }: ReactionParams) {
  const { id } = await params

  try {
    const reactionData = await db
      .select()
      .from(reactions)
      .where(eq(reactions.id, id))
      .limit(1)

    if (reactionData.length === 0) {
      notFound()
    }

    const reaction = reactionData[0]
    const relatedContent: Record<string, any> = {}

    // Get series data if available
    if (reaction.series_id) {
      const seriesData = await db
        .select()
        .from(series)
        .where(eq(series.id, reaction.series_id))
        .limit(1)
      
      if (seriesData.length > 0) {
        relatedContent.series = seriesData[0]
      }
    }

    // Get season data if available
    if (reaction.season_id) {
      const seasonData = await db
        .select()
        .from(seasons)
        .where(eq(seasons.id, reaction.season_id))
        .limit(1)
      
      if (seasonData.length > 0) {
        relatedContent.season = seasonData[0]
      }
    }

    // Get episode data if available
    if (reaction.episode_id) {
      const episodeData = await db
        .select()
        .from(episodes)
        .where(eq(episodes.id, reaction.episode_id))
        .limit(1)
      
      if (episodeData.length > 0) {
        relatedContent.episode = episodeData[0]
      }
    }

    // Fetch other reactions for the same series and season
    // Only fetch reactions with a unique title
    if (reaction.series_id) {
      const otherReactionsData = await db
        .select()
        .from(reactions)
        .where(
          reaction.season_id 
            ? and(eq(reactions.series_id, reaction.series_id), eq(reactions.season_id, reaction.season_id))
            : eq(reactions.series_id, reaction.series_id)
        )
      
      // Create a map to track unique titles
      const uniqueTitlesMap = new Map<string, typeof reactions.$inferSelect>()
      
      // Filter out the current reaction and keep only unique titles
      otherReactionsData
        .filter(r => r.id !== reaction.id)
        .forEach(r => {
          if (!uniqueTitlesMap.has(r.title)) {
            uniqueTitlesMap.set(r.title, r)
          }
        })
      
      relatedContent.otherReactions = Array.from(uniqueTitlesMap.values())
    } else {
      relatedContent.otherReactions = []
    }

    return (
      <ReactionDetails
        reaction={{
          ...reaction,
          createdAt: reaction.createdAt ?? new Date(),
          updatedAt: reaction.updatedAt ?? new Date(),
        }}
        relatedContent={relatedContent}
      />
    )
  } catch (error) {
    console.error("Error fetching reaction:", error)
    notFound()
  }
}
