"use server"

import { db } from "@/database/drizzle"
import { eq } from "drizzle-orm"
import { reactions, series, anime, seasons, episodes } from "@/database/schema"
import { ReactionParams } from "../types"

export const get_reaction = async (id: string) => {
    try {
      const reactionResult = await db
        .select({
          reaction: reactions,
          series: series,
          anime: anime,
          season: seasons,
          episode: episodes,
        })
        .from(reactions)
        .where(eq(reactions.id, id))
        .leftJoin(series, eq(reactions.series_id, series.id))
        .leftJoin(anime, eq(series.id, anime.series_id)) // Join anime if applicable
        .leftJoin(seasons, eq(reactions.season_id, seasons.id))
        .leftJoin(episodes, eq(reactions.episode_id, episodes.id))
        .limit(1)
  
      if (reactionResult.length === 0) {
        return {
          success: false,
          error: "Reaction not found",
        }
      }
  
      return {
        success: true,
        reaction: {
          ...reactionResult[0].reaction,
          series: reactionResult[0].series,
          anime: reactionResult[0].anime,
          season: reactionResult[0].season,
          episode: reactionResult[0].episode,
        } as ReactionParams, // ✅ Now correctly typed
      }
    } catch (error) {
      console.error(error)
      return {
        success: false,
        error: "Failed to get reaction",
      }
    }
  }
  
