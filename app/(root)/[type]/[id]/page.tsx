import { notFound } from "next/navigation"
import { db } from "@/database/drizzle"
import * as schema from "@/database/schema"
import { eq, and, asc } from "drizzle-orm"
import ContentDetails from "@/components/content/ContentDetails"
import { ContentType } from "@/lib/types"

type ContentParams = {
  params: {
    type: string
    id: string
  }
}

export default async function ContentPage({ params }: ContentParams) {
  const { type, id } = await params

  if (!["movie", "series", "anime", "season", "episode"].includes(type)) {
    notFound()
  }

  try {
    let content: any = null
    let relatedContent: Record<string, any> = {}

    if (type === "movie") {
      const movies = await db
        .select()
        .from(schema.movies)
        .where(eq(schema.movies.id, id))
        .limit(1)
      
      if (movies.length === 0) {
        notFound()
      }

      // Map movie data to ensure required fields are present
      content = {
        ...movies[0],
        description: movies[0].description || "",
        poster_path: movies[0].poster_path || "",
        backdrop_path: movies[0].backdrop_path || "",
        coverColor: movies[0].coverColor || "#000000",
      }

      const reactionsData = await db
        .select()
        .from(schema.reactions)
        .where(eq(schema.reactions.series_id, content.id))
      
      relatedContent.reactions = reactionsData
    }

    else if (type === "series" || type === "anime") {
      const seriesData = await db
        .select()
        .from(schema.series)
        .where(eq(schema.series.id, id))
        .limit(1)
      
      if (seriesData.length === 0) {
        notFound()
      }

      // Map series data to ensure required fields are present
      content = {
        ...seriesData[0],
        description: seriesData[0].description || "",
        poster_path: seriesData[0].poster_path || "",
        backdrop_path: seriesData[0].backdrop_path || "",
        coverColor: seriesData[0].coverColor || "#000000",
      }

      // Get seasons
      const seasonsData = await db
        .select()
        .from(schema.seasons)
        .where(eq(schema.seasons.series_id, id))
        .orderBy(asc(schema.seasons.season_number))
      
      // Map seasons to ensure required fields are present
      const mappedSeasons = seasonsData.map(season => ({
        ...season,
        description: season.overview || "", // Map overview to description
        poster_path: season.poster_path || "",
      }))
      
      // Get episodes
      const episodesData = await db
        .select()
        .from(schema.episodes)
        .where(eq(schema.episodes.series_id, id))
      
      // Map episodes to ensure required fields are present
      const mappedEpisodes = episodesData.map(episode => ({
        ...episode,
        description: episode.description || "",
        still_path: episode.still_path || "",
      }))
      
      // Get reactions
      const reactionsData = await db
        .select()
        .from(schema.reactions)
        .where(eq(schema.reactions.series_id, id))
      
      relatedContent = { 
        seasons: mappedSeasons, 
        episodes: mappedEpisodes, 
        reactions: reactionsData 
      }

      if (type === "anime") {
        const animeData = await db
          .select()
          .from(schema.anime)
          .where(eq(schema.anime.id, id))
          .limit(1)
        
        if (animeData.length > 0) {
          relatedContent.animeData = animeData[0]
        }
      }
    }

    else if (type === "season") {
      const seasonsData = await db
        .select()
        .from(schema.seasons)
        .where(eq(schema.seasons.id, id))
        .limit(1)
      
      if (seasonsData.length === 0) {
        notFound()
      }

      // Map season data to ensure required fields are present
      content = {
        ...seasonsData[0],
        description: seasonsData[0].overview || "", // Map overview to description
        poster_path: seasonsData[0].poster_path || "",
      }

      // Get series
      let mappedSeries = null
      if (content.series_id) {
        const seriesData = await db
          .select()
          .from(schema.series)
          .where(eq(schema.series.id, content.series_id))
          .limit(1)
        
        if (seriesData.length > 0) {
          mappedSeries = {
            ...seriesData[0],
            description: seriesData[0].description || "",
            poster_path: seriesData[0].poster_path || "",
            backdrop_path: seriesData[0].backdrop_path || "",
            coverColor: seriesData[0].coverColor || "#000000",
          }
        }
      }
      
      // Get episodes
      const episodesData = await db
        .select()
        .from(schema.episodes)
        .where(eq(schema.episodes.season_id, id))
        .orderBy(asc(schema.episodes.episode_number))
      
      // Map episodes to ensure required fields are present
      const mappedEpisodes = episodesData.map(episode => ({
        ...episode,
        description: episode.description || "",
        still_path: episode.still_path || "",
      }))
      
      // Get reactions
      const reactionsData = await db
        .select()
        .from(schema.reactions)
        .where(eq(schema.reactions.season_id, id))
      
      relatedContent = { 
        series: mappedSeries, 
        episodes: mappedEpisodes, 
        reactions: reactionsData 
      }
    }

    else if (type === "episode") {
      const episodesData = await db
        .select()
        .from(schema.episodes)
        .where(eq(schema.episodes.id, id))
        .limit(1)
      
      if (episodesData.length === 0) {
        notFound()
      }

      // Map episode data to ensure required fields are present
      content = {
        ...episodesData[0],
        description: episodesData[0].description || "",
        still_path: episodesData[0].still_path || "",
      }

      // Get series
      let mappedSeries = null
      if (content.series_id) {
        const seriesData = await db
          .select()
          .from(schema.series)
          .where(eq(schema.series.id, content.series_id))
          .limit(1)
        
        if (seriesData.length > 0) {
          mappedSeries = {
            ...seriesData[0],
            description: seriesData[0].description || "",
            poster_path: seriesData[0].poster_path || "",
            backdrop_path: seriesData[0].backdrop_path || "",
            coverColor: seriesData[0].coverColor || "#000000",
          }
        }
      }
      
      // Get season
      let mappedSeason = null
      if (content.season_id) {
        const seasonData = await db
          .select()
          .from(schema.seasons)
          .where(eq(schema.seasons.id, content.season_id))
          .limit(1)
        
        if (seasonData.length > 0) {
          mappedSeason = {
            ...seasonData[0],
            description: seasonData[0].overview || "", // Map overview to description
            poster_path: seasonData[0].poster_path || "",
          }
        }
      }
      
      // Get reactions
      const reactionsData = await db
        .select()
        .from(schema.reactions)
        .where(eq(schema.reactions.episode_id, id))
      
      // Get next episode
      let mappedNextEpisode = null
      if (content.season_id) {
        const nextEpisodeData = await db
          .select()
          .from(schema.episodes)
          .where(and(
            eq(schema.episodes.season_id, content.season_id),
            eq(schema.episodes.episode_number, content.episode_number + 1)
          ))
          .limit(1)
        
        if (nextEpisodeData.length > 0) {
          mappedNextEpisode = {
            ...nextEpisodeData[0],
            description: nextEpisodeData[0].description || "",
            still_path: nextEpisodeData[0].still_path || "",
          }
        }
      }
      
      // Get previous episode
      let mappedPrevEpisode = null
      if (content.season_id) {
        const prevEpisodeData = await db
          .select()
          .from(schema.episodes)
          .where(and(
            eq(schema.episodes.season_id, content.season_id),
            eq(schema.episodes.episode_number, content.episode_number - 1)
          ))
          .limit(1)
        
        if (prevEpisodeData.length > 0) {
          mappedPrevEpisode = {
            ...prevEpisodeData[0],
            description: prevEpisodeData[0].description || "",
            still_path: prevEpisodeData[0].still_path || "",
          }
        }
      }
      
      relatedContent = { 
        series: mappedSeries, 
        season: mappedSeason, 
        reactions: reactionsData,
        nextEpisode: mappedNextEpisode,
        prevEpisode: mappedPrevEpisode
      }
    }

    if (!content) {
      notFound()
    }

    return <ContentDetails type={type as ContentType} content={content} relatedContent={relatedContent} />
  } catch (error) {
    console.error("Error fetching content:", error)
    notFound()
  }
}