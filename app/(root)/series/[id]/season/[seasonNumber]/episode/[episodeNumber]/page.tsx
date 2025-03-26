import { notFound } from "next/navigation"
import { db } from "@/database/drizzle"
import { series, seasons, episodes, reactions } from "@/database/schema"
import { eq, and } from "drizzle-orm"
import ContentDetails from "@/components/content/ContentDetails"

type EpisodeParams = {
  params: {
    id: string
    seasonNumber: string
    episodeNumber: string
  }
}

export default async function EpisodePage({ params }: EpisodeParams) {
  const { id, seasonNumber, episodeNumber } = await params
  const seasonNum = Number.parseInt(seasonNumber)
  const episodeNum = Number.parseInt(episodeNumber)

  if (isNaN(seasonNum) || isNaN(episodeNum)) {
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
    console.log(season.id, " ", episodeNum)
    // Get the episode
    const episodeData = await db
      .select()
      .from(episodes)
      .where(and(eq(episodes.season_id, season.id), eq(episodes.episode_number, episodeNum)))
      .limit(1)

    if (episodeData.length === 0) {
      console.log("Episode not found")
    }

    const episode = episodeData[0]

    // Get reactions for this episode
    const episodeReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.episode_id, episode.id))

    // Get next and previous episodes
    const nextEpisodeData = await db
      .select()
      .from(episodes)
      .where(and(eq(episodes.season_id, season.id), eq(episodes.episode_number, episodeNum + 1)))
      .limit(1)

    const prevEpisodeData = await db
      .select()
      .from(episodes)
      .where(and(eq(episodes.season_id, season.id), eq(episodes.episode_number, episodeNum - 1)))
      .limit(1)

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

    const mappedEpisode = {
      ...episode,
      description: episode.description || "",
      still_path: episode.still_path || "",
    }

    const mappedNextEpisode = nextEpisodeData.length > 0 ? {
      ...nextEpisodeData[0],
      description: nextEpisodeData[0].description || "",
      still_path: nextEpisodeData[0].still_path || "",
    } : null

    const mappedPrevEpisode = prevEpisodeData.length > 0 ? {
      ...prevEpisodeData[0],
      description: prevEpisodeData[0].description || "",
      still_path: prevEpisodeData[0].still_path || "",
    } : null

    const relatedContent = {
      series: mappedSeries,
      season: mappedSeason,
      reactions: episodeReactions,
      nextEpisode: mappedNextEpisode,
      prevEpisode: mappedPrevEpisode,
    }

    return <ContentDetails type="episode" content={mappedEpisode} relatedContent={relatedContent} />
  } catch (error) {
    console.error("Error fetching episode:", error)
    notFound()
  }
}