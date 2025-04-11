import { notFound, unstable_rethrow } from "next/navigation"
import { db } from "@/database/drizzle"
import { reactions, series, seasons, episodes } from "@/database/schema"
import { eq, and } from "drizzle-orm"
import ReactionDetails from "@/components/content/ReactionDetails"
import { ReactionParams } from "@/lib/types"
import { auth } from "@/auth";

export default async function ReactionPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const session = await auth();

  try {
    // Fetch reaction data
    const reactionData = await db
      .select()
      .from(reactions)
      .where(eq(reactions.id, id))
      .limit(1)

    if (reactionData.length === 0) {
      notFound()
    }

    const rawReaction = reactionData[0]
    
    // Initialize related entities
    let seriesEntity = null
    let seasonEntity = null
    let episodeEntity = null
    let animeEntity = null

    // Get series data if available
    if (rawReaction.series_id) {
      const seriesData = await db
        .select()
        .from(series)
        .where(eq(series.id, rawReaction.series_id))
        .limit(1)
      
      if (seriesData.length > 0) {
        seriesEntity = seriesData[0]
      }
    }

    // Get season data if available
    if (rawReaction.season_id) {
      const seasonData = await db
        .select()
        .from(seasons)
        .where(eq(seasons.id, rawReaction.season_id))
        .limit(1)
      
      if (seasonData.length > 0) {
        seasonEntity = seasonData[0]
      }
    }

    // Get episode data if available
    if (rawReaction.episode_id) {
      const episodeData = await db
        .select()
        .from(episodes)
        .where(eq(episodes.id, rawReaction.episode_id))
        .limit(1)
      
      if (episodeData.length > 0) {
        episodeEntity = episodeData[0]
      }
    }

    // Build the complete ReactionParams object
    const reaction: ReactionParams = {
      ...rawReaction,
      series: seriesEntity,
      season: seasonEntity,
      episode: episodeEntity,
      anime: animeEntity,
      createdAt: rawReaction.createdAt ?? new Date(),
      updatedAt: rawReaction.updatedAt ?? new Date(),
    }

    const relatedContent: Record<string, any> = {
      series: seriesEntity,
      season: seasonEntity,
      episode: episodeEntity
    }

    // Fetch other reactions
    if (reaction.series_id) {
      const otherReactionsData = await db
        .select()
        .from(reactions)
        .where(
          reaction.season_id 
            ? and(eq(reactions.series_id, reaction.series_id), eq(reactions.season_id, reaction.season_id))
            : eq(reactions.series_id, reaction.series_id)
        )
      
      const uniqueTitlesMap = new Map<string, typeof reactions.$inferSelect>()
      
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
        reaction={reaction}
        relatedContent={relatedContent}
        session={session!}
      />
    )
  } catch (error) {
    console.error("Error fetching reaction:", error)
    
    // Use unstable_rethrow to properly handle Next.js internal errors
    if (error instanceof Error && 
        (error.message.includes('NEXT_NOT_FOUND') || 
         error.message.includes('NEXT_REDIRECT'))) {
      unstable_rethrow(error)
    }
    
    // For other errors, show not found
    notFound()
  }
}
