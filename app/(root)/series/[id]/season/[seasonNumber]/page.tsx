import { notFound } from "next/navigation"
import { db } from "@/database/drizzle"
import { series, seasons, episodes, reactions } from "@/database/schema"
import { eq, and, asc } from "drizzle-orm"
import ContentDetails from "@/components/content/ContentDetails"

type SeasonParams = {
  params: {
    id: string
    seasonNumber: string
  }
}

export default async function SeasonPage({ params }: SeasonParams) {
  const { id, seasonNumber } = await params
  const seasonNum = Number.parseInt(seasonNumber)

  if (isNaN(seasonNum)) {
    notFound()
  }

  try {
    // Get the series
    const seriesData = await db
      .select()
      .from(series)
      .where(eq(series.id, id))
      .limit(1)

    if (seriesData.length === 0) {
      notFound()
    }

    // Get the season
    const seasonData = await db
      .select()
      .from(seasons)
      .where(and(eq(seasons.series_id, id), eq(seasons.season_number, seasonNum)))
      .limit(1)

    if (seasonData.length === 0) {
      notFound()
    }

    const season = seasonData[0]

    // Get episodes for this season
    const seasonEpisodes = await db
      .select()
      .from(episodes)
      .where(eq(episodes.season_id, season.id))
      .orderBy(asc(episodes.episode_number))

    // Get reactions for this season
    const seasonReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.season_id, season.id))

    // Map the database objects to the expected component types
    const mappedSeries = {
      ...seriesData[0],
      description: seriesData[0].description || "",
      poster_path: seriesData[0].poster_path || "",
      backdrop_path: seriesData[0].backdrop_path || "",
      coverColor: seriesData[0].coverColor || "#000000",
    }

    const mappedSeason = {
      ...season,
      description: season.overview || "", // Map overview to description
      poster_path: season.poster_path || "",
    }

    const mappedEpisodes = seasonEpisodes.map(episode => ({
      ...episode,
      description: episode.description || "",
      still_path: episode.still_path || "",
    }))

    const relatedContent = {
      series: mappedSeries,
      episodes: mappedEpisodes,
      reactions: seasonReactions,
    }

    return <ContentDetails type="season" content={mappedSeason} relatedContent={relatedContent} />
  } catch (error) {
    console.error("Error fetching season:", error)
    notFound()
  }
}