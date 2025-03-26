import { db } from "@/database/drizzle"
import { movies, series, seasons, episodes, reactions } from "@/database/schema"
import { sql, eq, or, ilike, and } from "drizzle-orm"

export type SearchResult = {
  id: string
  title: string
  type: "movie" | "series" | "anime" | "season" | "episode" | "reaction"
  poster_path?: string | null
  backdrop_path?: string | null
  description?: string | null
  year?: string | null
  parent_title?: string | null
  parent_id?: string | null
  series_id?: string | null
  season_id?: string | null
  episode_id?: string | null
  season_number?: number | null
  episode_number?: number | null
  genres?: any | null
  has_reaction?: boolean
  reaction_count?: number
  thumbnail?: string | null
  first_link?: string | null
  second_link?: string | null
  episode?: string | null
  season_title?: string | null
  [key: string]: any
}

export type SearchOptions = {
  query: string
  limit?: number
  type?: string
  genre?: string
  includeReactions?: boolean
}

export async function searchContent({
  query,
  limit = 10,
  type,
  genre,
  includeReactions = true,
}: SearchOptions): Promise<SearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  try {
    // Search pattern with wildcard
    const searchPattern = `%${query}%`

    // Build queries for each content type
    const queries = []

    // Movies query
    queries.push(
      db
        .select({
          id: movies.id,
          title: movies.title,
          original_title: movies.original_title,
          description: movies.description,
          poster_path: movies.poster_path,
          backdrop_path: movies.backdrop_path,
          release_date: movies.release_date,
          genres: movies.genres,
          type: sql<"movie">`'movie'`.as("type"),
          year: sql`EXTRACT(YEAR FROM ${movies.release_date})::text`,
          has_reaction: sql<boolean>`EXISTS (
          SELECT 1 FROM reactions 
          WHERE reactions.series_id = ${movies.id}
        )`.as("has_reaction"),
          reaction_count: sql<number>`(
          SELECT COUNT(*) FROM reactions 
          WHERE reactions.series_id = ${movies.id}
        )`.as("reaction_count"),
        })
        .from(movies)
        .where(
          or(
            ilike(movies.title, searchPattern),
            ilike(movies.original_title, searchPattern),
            ilike(movies.description, searchPattern),
            sql`${movies.genres}::text ILIKE ${searchPattern}`,
          ),
        )
        .limit(limit),
    )

    // Series query
    queries.push(
      db
        .select({
          id: series.id,
          title: series.title,
          original_title: series.original_title,
          description: series.description,
          poster_path: series.poster_path,
          backdrop_path: series.backdrop_path,
          first_air_date: series.first_air_date,
          last_air_date: series.last_air_date,
          number_of_seasons: series.number_of_seasons,
          number_of_episodes: series.number_of_episodes,
          genres: series.genres,
          type: sql<"series">`'series'`.as("type"),
          year: sql`EXTRACT(YEAR FROM ${series.first_air_date})::text`,
          has_reaction: sql<boolean>`EXISTS (
          SELECT 1 FROM reactions 
          WHERE reactions.series_id = ${series.id}
        )`.as("has_reaction"),
          reaction_count: sql<number>`(
          SELECT COUNT(*) FROM reactions 
          WHERE reactions.series_id = ${series.id}
        )`.as("reaction_count"),
        })
        .from(series)
        .where(
          and(
            eq(series.is_anime, false),
            or(
              ilike(series.title, searchPattern),
              ilike(series.original_title, searchPattern),
              ilike(series.description, searchPattern),
              sql`${series.genres}::text ILIKE ${searchPattern}`,
            ),
          ),
        )
        .limit(limit),
    )

    // Anime query
    queries.push(
      db
        .select({
          id: series.id,
          title: series.title,
          original_title: series.original_title,
          description: series.description,
          poster_path: series.poster_path,
          backdrop_path: series.backdrop_path,
          first_air_date: series.first_air_date,
          last_air_date: series.last_air_date,
          number_of_seasons: series.number_of_seasons,
          number_of_episodes: series.number_of_episodes,
          genres: series.genres,
          type: sql<"anime">`'anime'`.as("type"),
          year: sql`EXTRACT(YEAR FROM ${series.first_air_date})::text`,
          has_reaction: sql<boolean>`EXISTS (
          SELECT 1 FROM reactions 
          WHERE reactions.series_id = ${series.id}
        )`.as("has_reaction"),
          reaction_count: sql<number>`(
          SELECT COUNT(*) FROM reactions 
          WHERE reactions.series_id = ${series.id}
        )`.as("reaction_count"),
        })
        .from(series)
        .where(
          and(
            eq(series.is_anime, true),
            or(
              ilike(series.title, searchPattern),
              ilike(series.original_title, searchPattern),
              ilike(series.description, searchPattern),
              sql`${series.genres}::text ILIKE ${searchPattern}`,
            ),
          ),
        )
        .limit(limit),
    )

    // Seasons query
    queries.push(
      db
        .select({
          id: seasons.id,
          title: sql<string>`'Season ' || ${seasons.season_number}`.as("title"),
          overview: seasons.overview,
          poster_path: seasons.poster_path,
          air_date: seasons.air_date,
          season_number: seasons.season_number,
          type: sql<"season">`'season'`.as("type"),
          parent_id: series.id,
          parent_title: series.title,
          parent_poster: series.poster_path,
          series_id: series.id,
          year: sql`EXTRACT(YEAR FROM ${seasons.air_date})::text`,
          has_reaction: sql<boolean>`EXISTS (
          SELECT 1 FROM reactions 
          WHERE reactions.season_id = ${seasons.id}
        )`.as("has_reaction"),
          reaction_count: sql<number>`(
          SELECT COUNT(*) FROM reactions 
          WHERE reactions.season_id = ${seasons.id}
        )`.as("reaction_count"),
        })
        .from(seasons)
        .leftJoin(series, eq(seasons.series_id, series.id))
        .where(
          or(
            ilike(seasons.overview, searchPattern),
            ilike(series.title, searchPattern),
            sql`'Season ' || ${seasons.season_number} ILIKE ${searchPattern}`,
          ),
        )
        .limit(limit),
    )

    // Episodes query
    queries.push(
      db
        .select({
          id: episodes.id,
          title: episodes.title,
          description: episodes.description,
          poster_path: episodes.still_path,
          air_date: episodes.air_date,
          episode_number: episodes.episode_number,
          type: sql<"episode">`'episode'`.as("type"),
          parent_id: series.id,
          parent_title: series.title,
          parent_poster: series.poster_path,
          series_id: series.id,
          season_id: episodes.season_id,
          season_number: sql<number>`(
          SELECT season_number FROM seasons 
          WHERE id = ${episodes.season_id}
        )`.as("season_number"),
          year: sql`EXTRACT(YEAR FROM ${episodes.air_date})::text`,
          has_reaction: sql<boolean>`EXISTS (
          SELECT 1 FROM reactions 
          WHERE reactions.episode_id = ${episodes.id}
        )`.as("has_reaction"),
          reaction_count: sql<number>`(
          SELECT COUNT(*) FROM reactions 
          WHERE reactions.episode_id = ${episodes.id}
        )`.as("reaction_count"),
        })
        .from(episodes)
        .leftJoin(series, eq(episodes.series_id, series.id))
        .where(
          or(
            ilike(episodes.title, searchPattern),
            ilike(episodes.description, searchPattern),
            // Match "S01E01" format
            sql`'S' || LPAD((
            SELECT season_number FROM seasons 
            WHERE id = ${episodes.season_id}
          )::text, 2, '0') || 'E' || LPAD(${episodes.episode_number}::text, 2, '0') ILIKE ${searchPattern}`,
            // Match just episode number like "E5" or "Episode 5"
            sql`'E' || ${episodes.episode_number}::text ILIKE ${searchPattern}`,
            sql`'Episode ' || ${episodes.episode_number}::text ILIKE ${searchPattern}`,
            // Match just the number
            sql`${episodes.episode_number}::text = ${query}`,
          ),
        )
        .limit(limit),
    )

    // Reactions query (optional)
    if (includeReactions) {
      queries.push(
        db
          .select({
            id: reactions.id,
            title: reactions.title,
            episode: reactions.episode,
            thumbnail: reactions.thumbnail,
            first_link: reactions.first_link,
            second_link: reactions.second_link,
            season_number: reactions.season_number,
            season_title: reactions.season_title,
            type: sql<"reaction">`'reaction'`.as("type"),
            series_id: reactions.series_id,
            season_id: reactions.season_id,
            episode_id: reactions.episode_id,
            parent_title: sql<string>`(
            SELECT title FROM series 
            WHERE id = ${reactions.series_id}
          )`.as("parent_title"),
            poster_path: sql<string>`(
            CASE 
              WHEN ${reactions.episode_id} IS NOT NULL THEN (
                SELECT still_path FROM episodes 
                WHERE id = ${reactions.episode_id}
              )
              WHEN ${reactions.season_id} IS NOT NULL THEN (
                SELECT poster_path FROM seasons 
                WHERE id = ${reactions.season_id}
              )
              ELSE (
                SELECT poster_path FROM series 
                WHERE id = ${reactions.series_id}
              )
            END
          )`.as("poster_path"),
            year: sql`EXTRACT(YEAR FROM ${reactions.createdAt})::text`,
          })
          .from(reactions)
          .where(
            or(
              ilike(reactions.title, searchPattern),
              ilike(reactions.episode, searchPattern),
              ilike(reactions.season_title, searchPattern),
            ),
          )
          .limit(limit),
      )
    }

    // Execute all queries in parallel
    const results = await Promise.all(queries)

    // Combine all results
    let combinedResults = results.flat().map((item) => ({
      ...item,
      year: item.year?.toString() || null,
    })) as SearchResult[]

    // Apply type filter if specified
    if (type) {
      combinedResults = combinedResults.filter((item) => item.type === type)
    }

    // Apply genre filter if specified
    if (genre) {
      combinedResults = combinedResults.filter((item) => {
        if (!item.genres) return false

        // Handle JSONB array of genres
        try {
          const genres = typeof item.genres === "string" ? JSON.parse(item.genres) : item.genres

          return (
            Array.isArray(genres) &&
            genres.some((g: any) =>
              typeof g === "string"
                ? g.toLowerCase().includes(genre.toLowerCase())
                : g.name?.toLowerCase().includes(genre.toLowerCase()),
            )
          )
        } catch (e) {
          return false
        }
      })
    }

    // Advanced sorting algorithm
    combinedResults.sort((a, b) => {
      // First prioritize reactions
      if (a.type === "reaction" && b.type !== "reaction") return -1
      if (a.type !== "reaction" && b.type === "reaction") return 1

      // Then prioritize items with reactions
      const aHasReaction = !!a.has_reaction
      const bHasReaction = !!b.has_reaction

      if (aHasReaction && !bHasReaction) return -1
      if (!aHasReaction && bHasReaction) return 1

      // Then prioritize reaction count
      const aReactionCount = a.reaction_count || 0
      const bReactionCount = b.reaction_count || 0

      if (aReactionCount !== bReactionCount) {
        return bReactionCount - aReactionCount
      }

      // Then prioritize main content types over episodes/seasons
      const aMainContent = ["movie", "series", "anime"].includes(a.type)
      const bMainContent = ["movie", "series", "anime"].includes(b.type)

      if (aMainContent && !bMainContent) return -1
      if (!aMainContent && bMainContent) return 1

      // Exact title matches first
      const aExact = a.title.toLowerCase() === query.toLowerCase()
      const bExact = b.title.toLowerCase() === query.toLowerCase()

      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1

      // Then title starts with query
      const aStartsWith = a.title.toLowerCase().startsWith(query.toLowerCase())
      const bStartsWith = b.title.toLowerCase().startsWith(query.toLowerCase())

      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1

      // Then by recency (year)
      if (a.year && b.year) {
        const yearA = Number.parseInt(a.year)
        const yearB = Number.parseInt(b.year)
        if (!isNaN(yearA) && !isNaN(yearB) && yearA !== yearB) {
          return yearB - yearA // More recent first
        }
      }

      // Finally alphabetical
      return a.title.localeCompare(b.title)
    })

    // Limit final results
    return combinedResults.slice(0, limit)
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}

// Helper function to get content URL based on type
export function getContentUrl(item: SearchResult): string {
  switch (item.type) {
    case "movie":
      return `/movies/${item.id}`
    case "series":
      return `/series/${item.id}`
    case "anime":
      return `/anime/${item.id}`
    case "season":
      return `/series/${item.series_id}/season/${item.season_number}`
    case "episode":
      return `/series/${item.series_id}/season/${item.season_number}/episode/${item.episode_number}`
    case "reaction":
      if (item.episode_id) {
        return `/reactions/episode/${item.episode_id}`
      } else if (item.season_id) {
        return `/reactions/season/${item.season_id}`
      } else {
        return `/reactions/series/${item.series_id}`
      }
    default:
      return "#"
  }
}

// Helper function to get formatted title with context
export function getFormattedTitle(item: SearchResult): string {
  switch (item.type) {
    case "season":
      return `${item.parent_title} - ${item.title}`
    case "episode":
      return `${item.parent_title} - S${item.season_number?.toString().padStart(2, "0")}E${item.episode_number?.toString().padStart(2, "0")} - ${item.title}`
    case "reaction":
      return `Reaction: ${item.title}`
    default:
      return item.title
  }
}

