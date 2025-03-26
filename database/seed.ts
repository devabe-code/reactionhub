import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import fetch from "node-fetch";
import { Vibrant } from "node-vibrant/node";
import {
  anime,
  manga,
  characters,
  series,
  seasons,
  episodes,
  movies,
} from "./schema";
import { eq, and } from "drizzle-orm";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const JIKAN_BASE = "https://api.jikan.moe/v4";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// Utility functions
const sleep = (ms: number) => {
  const jitter = Math.floor(Math.random() * 500);
  return new Promise((res) => setTimeout(res, ms + jitter));
};

const parseDate = (d?: string | null) =>
  d ? new Date(d).toISOString().split("T")[0] : null;

const getColor = async (url?: string | null) => {
  if (!url) return "#FFFFFF";
  try {
    const palette = await Vibrant.from(url).getPalette();
    return palette.Vibrant?.hex || "#FFFFFF";
  } catch {
    return "#FFFFFF";
  }
};

async function fetchWithRetry<T>(url: string, maxRetries = 5): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        retries++;
        if (retries > maxRetries) {
          throw new Error(`Maximum retries (${maxRetries}) exceeded for ${url}`);
        }
        const retryAfter = res.headers.get("retry-after");
        const waitTime = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, retries) * 1000;
        console.log(
          `Rate limited (429) for ${url}. Retrying in ${waitTime / 1000}s (attempt ${retries}/${maxRetries})`
        );
        await sleep(waitTime);
        continue;
      }
      if (!res.ok) {
        throw new Error(`Failed to fetch from ${url} (${res.status})`);
      }
      const json = await res.json();
      return json.data ?? json;
    } catch (error) {
      retries++;
      if (
        retries > maxRetries ||
        !(error instanceof Error) ||
        !error.message.includes("429")
      ) {
        throw error;
      }
      const waitTime = Math.pow(2, retries) * 1000;
      console.log(
        `Error fetching ${url}. Retrying in ${waitTime / 1000}s (attempt ${retries}/${maxRetries})`
      );
      await sleep(waitTime);
    }
  }
}

// --- Mappings & Constants ---

// Hard-coded content IDs (MAL ID, optional TMDB ID, and type)
const CONTENT_IDS: [number, number | null, "anime" | "manga" | "movie"][] = [
  [21, 37854, "anime"], // One Piece
  [11061, 46298, "anime"], // Hunter x Hunter
  [20583, 60863, "anime"], // Haikyuu!!
  [1, 30991, "anime"], // Cowboy Bebop
  [20, 46260, "anime"], // Naruto
  [16498, 1429, "anime"], // Attack on Titan
  [1535, 13916, "anime"], // Death Note
  [459, 19576, "movie"], // One Piece Movie
  [13, null, "manga"], // One Piece manga
  [1630, null, "manga"], // Hunter x Hunter manga
  [35243, null, "manga"], // Haikyuu!! manga
];

// TMDB mappings for anime (MAL ID -> TMDB ID)
const ANIME_TMDB_MAPPINGS: Record<number, number> = {
  21: 37854, // One Piece
  11061: 46298, // Hunter x Hunter
  20583: 60863, // Haikyuu!!
  1: 30991, // Cowboy Bebop
  20: 46260, // Naruto
  16498: 1429, // Attack on Titan
  1535: 13916, // Death Note
};

// Season info for anime without TMDB data or with incomplete TMDB data
const ANIME_SEASONS: Record<number, { seasons: number; episodesPerSeason?: number[] }> = {
  21: {
    seasons: 20,
    episodesPerSeason: [61, 16, 52, 39, 13, 52, 33, 35, 73, 45, 26, 60, 62, 60, 118, 55, 118, 62, 55, 51],
  },
  11061: {
    seasons: 6,
    episodesPerSeason: [21, 5, 10, 22, 17, 61, 12],
  },
  20583: {
    seasons: 4,
    episodesPerSeason: [25, 25, 10, 25],
  },
  1: {
    seasons: 1,
    episodesPerSeason: [26],
  },
  20: {
    seasons: 5,
    episodesPerSeason: [35, 50, 50, 50, 35],
  },
  16498: {
    seasons: 4,
    episodesPerSeason: [25, 12, 22, 28],
  },
  1535: {
    seasons: 1,
    episodesPerSeason: [37],
  },
};

// --- Content Insertion Functions ---

// Insert Characters from Jikan data
async function insertCharacters(list: any[]) {
  for (const c of list) {
    try {
      const char = c.character || c;
      const exists = await db
        .select()
        .from(characters)
        .where(eq(characters.mal_id, char.mal_id));
      if (exists.length) continue;
      const fullChars = await fetchWithRetry<any>(
        `${JIKAN_BASE}/characters/${char.mal_id}/full`
      );
      await db.insert(characters).values({
        mal_id: fullChars.mal_id,
        name: fullChars.name,
        name_kanji: fullChars.name_kanji || null,
        nicknames: fullChars.nicknames || [],
        favorites: fullChars.favorites || 0,
        about: fullChars.about || "",
        images: fullChars.images || {},
      });
      await sleep(1000);
    } catch (error) {
      console.error(`Error inserting character:`, error);
    }
  }
}

// Insert an Anime record and its characters; if a TMDB ID is provided, also insert series data.
async function insertAnime(id: number, tmdbId: number | null) {
  try {
    const exists = await db.select().from(anime).where(eq(anime.mal_id, id));
    if (exists.length) return;
    
    const data = await fetchWithRetry<any>(`${JIKAN_BASE}/anime/${id}/full`);
    const color = await getColor(data.images?.jpg?.large_image_url);
    
    await db.insert(anime).values({
      mal_id: id,
      title: data.title,
      title_japanese: data.title_japanese || "",
      title_english: data.title_english || "",
      title_synonyms: data.title_synonyms || [],
      type: data.type,
      source: data.source || "",
      status: data.status,
      airing: data.airing || false,
      episodes: data.episodes || 0,
      duration: data.duration || "",
      rating: data.rating || "",
      season: data.season,
      year: data.year,
      score: Math.round((data.score || 0) * 10),
      scored_by: data.scored_by || 0,
      rank: data.rank || 0,
      popularity: data.popularity || 0,
      members: data.members || 0,
      favorites: data.favorites || 0,
      synopsis: data.synopsis || "",
      background: data.background || "",
      approved: data.approved ?? true,
      aired_from: parseDate(data.aired?.from),
      aired_to: parseDate(data.aired?.to),
      broadcast: data.broadcast || {},
      trailer: data.trailer || {},
      images: data.images || {},
      coverColor: color,
    });

    await sleep(2000);
    const chars = await fetchWithRetry<any[]>(
      `${JIKAN_BASE}/anime/${id}/characters`
    );
    await insertCharacters(chars);

    if (tmdbId) await insertSeries(tmdbId, true);
  } catch (error) {
    console.error(`Error inserting anime ${id}:`, error);
  }
}

// Insert a Manga record and its characters.
async function insertManga(id: number) {
  try {
    const exists = await db.select().from(manga).where(eq(manga.mal_id, id));
    if (exists.length) return;
    
    const data = await fetchWithRetry<any>(`${JIKAN_BASE}/manga/${id}/full`);
    const color = await getColor(data.images?.jpg?.large_image_url);
    
    await db.insert(manga).values({
      mal_id: id,
      title: data.title,
      title_japanese: data.title_japanese || "",
      title_english: data.title_english || "",
      title_synonyms: data.title_synonyms || [],
      type: data.type || "",
      status: data.status || "",
      chapters: data.chapters || 0,
      volumes: data.volumes || 0,
      publishing: data.publishing || false,
      score: Math.round((data.score || 0) * 10),
      scored_by: data.scored_by || 0,
      rank: data.rank || 0,
      popularity: data.popularity || 0,
      members: data.members || 0,
      favorites: data.favorites || 0,
      synopsis: data.synopsis || "",
      background: data.background || "",
      published_from: parseDate(data.published?.from),
      published_to: parseDate(data.published?.to),
      images: data.images || {},
      authors: data.authors || [],
      serializations: data.serializations || [],
      external: data.external || [],
      coverColor: color,
    });

    await sleep(2000);
    const chars = await fetchWithRetry<any[]>(
      `${JIKAN_BASE}/manga/${id}/characters`
    );
    await insertCharacters(chars);
  } catch (error) {
    console.error(`Error inserting manga ${id}:`, error);
  }
}

// Insert a Movie record using TMDB data.
async function insertMovie(tmdbId: number) {
  try {
    const exists = await db.select().from(movies).where(eq(movies.tmdb_id, tmdbId));
    if (exists.length) return;
    
    const data = await fetchWithRetry<any>(
      `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    const poster = data.poster_path ? `${TMDB_IMG}${data.poster_path}` : null;
    const color = await getColor(poster);
    
    await db.insert(movies).values({
      tmdb_id: data.id,
      title: data.title,
      original_title: data.original_title || "",
      description: data.overview || "",
      tagline: data.tagline || "",
      release_date: parseDate(data.release_date),
      runtime: data.runtime || 0,
      budget: data.budget || 0,
      revenue: data.revenue || 0,
      language: data.original_language || "en",
      status: data.status,
      poster_path: data.poster_path || "",
      backdrop_path: data.backdrop_path || "",
      imdb_id: data.imdb_id || "",
      popularity: Math.round(data.popularity || 0),
      vote_average: Math.round((data.vote_average || 0) * 10),
      vote_count: data.vote_count || 0,
      coverColor: color,
      genres: data.genres || [],
      production_companies: data.production_companies || [],
    });
  } catch (error) {
    console.error(`Error inserting movie ${tmdbId}:`, error);
  }
}

// --- Series & Episodes Insertion Functions ---

// (1) Insert series using TMDB's TV endpoint (used by insertAnime)
async function insertSeries(tmdbId: number, isAnime: boolean) {
  try {
    const exists = await db.select().from(series).where(eq(series.tmdb_id, tmdbId));
    if (exists.length) return;
    
    const url = `${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=seasons`;
    const data = await fetchWithRetry<any>(url);

    if (!data || typeof data !== "object" || !("id" in data)) {
      console.warn(`TMDB series not found or invalid for ID ${tmdbId}`);
      return;
    }

    const poster = data.poster_path ? `${TMDB_IMG}${data.poster_path}` : null;
    const color = await getColor(poster);

    const [s] = await db.insert(series).values({
      tmdb_id: data.id,
      title: data.name,
      original_title: data.original_name || "",
      description: data.overview || "",
      first_air_date: parseDate(data.first_air_date),
      last_air_date: parseDate(data.last_air_date),
      number_of_seasons: data.number_of_seasons || 0,
      number_of_episodes: data.number_of_episodes || 0,
      language: data.original_language || "en",
      status: data.status,
      poster_path: data.poster_path || "",
      backdrop_path: data.backdrop_path || "",
      coverColor: color,
      genres: data.genres || [],
      production_companies: data.production_companies || [],
      is_anime: isAnime,
    }).returning();

    for (const season of data.seasons || []) {
      if (!season.season_number || season.season_number === 0) continue;
      await sleep(1000);
      const seasonData = await fetchWithRetry<any>(
        `${TMDB_BASE}/tv/${tmdbId}/season/${season.season_number}?api_key=${TMDB_API_KEY}`
      );
      const [seasonRecord] = await db.insert(seasons).values({
        series_id: s.id,
        season_number: season.season_number,
        air_date: parseDate(season.air_date),
        poster_path: season.poster_path || "",
        overview: season.overview || "",
        tmdb_id: season.id,
      }).returning();

      for (const ep of seasonData.episodes || []) {
        await db.insert(episodes).values({
          series_id: s.id,
          season_id: seasonRecord.id,
          tmdb_id: ep.id,
          title: ep.name || `Episode ${ep.episode_number}`,
          description: ep.overview || "",
          air_date: parseDate(ep.air_date),
          episode_number: ep.episode_number,
          season_number: season.season_number,
          still_path: ep.still_path || "",
          runtime: ep.runtime || 0,
          vote_average: Math.round((ep.vote_average || 0) * 10),
          vote_count: ep.vote_count || 0,
          production_code: ep.production_code || "",
        });
      }
    }
  } catch (error) {
    console.error(`Error inserting series ${tmdbId}:`, error);
  }
}

// (2) Insert series from TMDB using an anime record (if a mapping exists)
async function insertSeriesFromTMDB(animeRecord: any, tmdbId: number) {
  try {
    const existingSeries = await db.select().from(series).where(eq(series.tmdb_id, tmdbId));
    if (existingSeries.length > 0) {
      console.log(`Series with TMDB ID ${tmdbId} already exists. Skipping.`);
      return existingSeries[0];
    }
    
    console.log(`Fetching TMDB series data for ID ${tmdbId}...`);
    const url = `${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=seasons`;
    const data = await fetchWithRetry<any>(url);

    if (!data || typeof data !== "object" || !("id" in data)) {
      console.warn(`TMDB series not found or invalid for ID ${tmdbId}`);
      return null;
    }

    const poster = data.poster_path ? `${TMDB_IMG}${data.poster_path}` : null;
    const color = await getColor(poster);

    console.log(`Inserting series: ${data.name}`);
    const [seriesRecord] = await db.insert(series).values({
      tmdb_id: data.id,
      title: data.name,
      original_title: data.original_name || "",
      description: data.overview || "",
      first_air_date: parseDate(data.first_air_date),
      last_air_date: parseDate(data.last_air_date),
      number_of_seasons: data.number_of_seasons || 0,
      number_of_episodes: data.number_of_episodes || 0,
      language: data.original_language || "en",
      status: data.status,
      poster_path: data.poster_path || "",
      backdrop_path: data.backdrop_path || "",
      coverColor: color,
      genres: data.genres || [],
      production_companies: data.production_companies || [],
      is_anime: true,
    }).returning();

    for (const season of data.seasons || []) {
      if (!season.season_number || season.season_number === 0) continue;
      await sleep(1000);
      console.log(`Fetching season ${season.season_number} data...`);
      const seasonData = await fetchWithRetry<any>(
        `${TMDB_BASE}/tv/${tmdbId}/season/${season.season_number}?api_key=${TMDB_API_KEY}`
      );
      console.log(`Inserting season ${season.season_number}`);
      const [seasonRecord] = await db.insert(seasons).values({
        series_id: seriesRecord.id,
        season_number: season.season_number,
        air_date: parseDate(season.air_date),
        poster_path: season.poster_path || "",
        overview: season.overview || "",
        tmdb_id: season.id,
      }).returning();

      for (const ep of seasonData.episodes || []) {
        console.log(`Inserting episode ${ep.episode_number} of season ${season.season_number}`);
        await db.insert(episodes).values({
          series_id: seriesRecord.id,
          season_id: seasonRecord.id,
          tmdb_id: ep.id,
          title: ep.name || `Episode ${ep.episode_number}`,
          description: ep.overview || "",
          air_date: parseDate(ep.air_date),
          episode_number: ep.episode_number,
          season_number: season.season_number,
          still_path: ep.still_path || "",
          runtime: ep.runtime || 0,
          vote_average: Math.round((ep.vote_average || 0) * 10),
          vote_count: ep.vote_count || 0,
          production_code: ep.production_code || "",
        });
      }
    }
    return seriesRecord;
  } catch (error) {
    console.error(`Error inserting series from TMDB ${tmdbId}:`, error);
    return null;
  }
}

// (3) Create a series from existing anime data (if no TMDB mapping exists)
async function createSeriesFromAnime(animeRecord: any) {
  try {
    const existingSeries = await db
      .select()
      .from(series)
      .where(
        and(
          eq(series.title, animeRecord.title),
          eq(series.is_anime, true)
        )
      );
    if (existingSeries.length > 0) {
      console.log(`Series for anime ${animeRecord.title} already exists. Skipping.`);
      return existingSeries[0];
    }
    const animeImage =
      animeRecord.images?.jpg?.large_image_url || animeRecord.images?.jpg?.image_url;
    const color = await getColor(animeImage);
    console.log(`Creating series for anime: ${animeRecord.title}`);
    const [seriesRecord] = await db.insert(series).values({
      tmdb_id: null, // No TMDB ID available
      title: animeRecord.title,
      original_title: animeRecord.title_japanese || "",
      description: animeRecord.synopsis || "",
      first_air_date: parseDate(animeRecord.aired_from),
      last_air_date: parseDate(animeRecord.aired_to),
      number_of_seasons: ANIME_SEASONS[animeRecord.mal_id]?.seasons || 1,
      number_of_episodes: animeRecord.episodes || 0,
      language: "ja",
      status: animeRecord.status,
      poster_path: animeRecord.images?.jpg?.large_image_url || "",
      backdrop_path: "",
      coverColor: color,
      genres: animeRecord.genres || [],
      production_companies: animeRecord.studios || [],
      is_anime: true,
    }).returning();
    return seriesRecord;
  } catch (error) {
    console.error(`Error creating series for anime ${animeRecord.title}:`, error);
    return null;
  }
}

// (4) Create seasons and episodes for a given series using predefined season info.
async function createSeasonsAndEpisodes(seriesRecord: any, animeRecord: any) {
  try {
    const malId = animeRecord.mal_id;
    const seasonInfo = ANIME_SEASONS[malId];
    if (!seasonInfo) {
      console.warn(`No season info defined for anime ${animeRecord.title} (MAL ID: ${malId})`);
      return;
    }
    const numSeasons = seasonInfo.seasons;
    const episodesPerSeason = seasonInfo.episodesPerSeason || [];
    const existingSeasons = await db
      .select()
      .from(seasons)
      .where(eq(seasons.series_id, seriesRecord.id));
    if (existingSeasons.length > 0) {
      console.log(`Seasons for series ${seriesRecord.title} already exist. Skipping.`);
      return;
    }
    console.log(`Creating ${numSeasons} seasons for ${seriesRecord.title}`);
    let episodeCounts: number[] = [];
    if (episodesPerSeason.length === 0) {
      const totalEpisodes = animeRecord.episodes || 0;
      const baseEpisodesPerSeason = Math.floor(totalEpisodes / numSeasons);
      const remainder = totalEpisodes % numSeasons;
      episodeCounts = Array(numSeasons).fill(baseEpisodesPerSeason);
      for (let i = 0; i < remainder; i++) {
        episodeCounts[i]++;
      }
    } else {
      episodeCounts = episodesPerSeason;
    }
    let globalEpisodeCount = 1;
    for (let seasonNum = 1; seasonNum <= numSeasons; seasonNum++) {
      const episodeCount = episodeCounts[seasonNum - 1] || 0;
      if (episodeCount === 0) continue;
      console.log(`Creating season ${seasonNum} with ${episodeCount} episodes`);
      const [seasonRecord] = await db.insert(seasons).values({
        series_id: seriesRecord.id,
        season_number: seasonNum,
        air_date: seasonNum === 1 ? parseDate(animeRecord.aired_from) : null,
        poster_path: animeRecord.images?.jpg?.large_image_url || "",
        overview: `Season ${seasonNum} of ${seriesRecord.title}`,
        tmdb_id: 0 - (malId * 100 + seasonNum), // Generate a negative fake ID
      }).returning();
      for (let epNum = 1; epNum <= episodeCount; epNum++) {
        console.log(`Creating episode ${epNum} of season ${seasonNum} (global #${globalEpisodeCount})`);
        await db.insert(episodes).values({
          series_id: seriesRecord.id,
          season_id: seasonRecord.id,
          tmdb_id: 0 - (malId * 10000 + seasonNum * 100 + epNum), // Negative fake ID
          title: `Episode ${epNum}`,
          description: "",
          air_date: null,
          episode_number: globalEpisodeCount,
          season_number: seasonNum,
          still_path: "",
          runtime: 0,
          vote_average: 0,
          vote_count: 0,
          production_code: "",
        });
        globalEpisodeCount++;
      }
      await sleep(500);
    }
    console.log(`Created ${numSeasons} seasons and ${globalEpisodeCount - 1} episodes for ${seriesRecord.title}`);
  } catch (error) {
    console.error(`Error creating seasons for series ${seriesRecord.title}:`, error);
  }
}

// --- Seed Runner Functions ---

// Seed content: anime, manga, movies, and characters.
async function seedContent() {
  console.log("🌱 Starting content seed process...");
  for (const [malId, tmdbId, type] of CONTENT_IDS) {
    try {
      console.log(
        `Processing ${type} with MAL ID ${malId}${tmdbId ? ` and TMDB ID ${tmdbId}` : ""}`
      );
      if (type === "anime") await insertAnime(malId, tmdbId);
      else if (type === "manga") await insertManga(malId);
      else if (type === "movie" && tmdbId) await insertMovie(tmdbId);
      console.log(`Completed ${type} with MAL ID ${malId}. Waiting before next item...`);
      await sleep(4000);
    } catch (err) {
      console.error(`Error processing ${type} with MAL ID ${malId}:`, err);
      await sleep(5000);
    }
  }
  console.log("Content seed completed!");
}

// Seed series, seasons, and episodes by processing all anime records.
async function seedSeriesAndEpisodes() {
  console.log("🌱 Starting series and episodes seed process...");
  const animeRecords = await db.select().from(anime);
  console.log(`Found ${animeRecords.length} anime records to process`);
  for (const animeRecord of animeRecords) {
    console.log(`\n=== Processing anime: ${animeRecord.title} (MAL ID: ${animeRecord.mal_id}) ===`);
    let seriesRecord = null;
    const tmdbId = ANIME_TMDB_MAPPINGS[animeRecord.mal_id];
    if (tmdbId) {
      console.log(`Found TMDB mapping: ${tmdbId} for anime ${animeRecord.title}`);
      seriesRecord = await insertSeriesFromTMDB(animeRecord, tmdbId);
    }
    if (!seriesRecord) {
      console.log(`No TMDB data available for ${animeRecord.title}, creating from anime data`);
      seriesRecord = await createSeriesFromAnime(animeRecord);
    }
    if (seriesRecord) {
      const seasonsCount = await db.select().from(seasons).where(eq(seasons.series_id, seriesRecord.id));
      if (seasonsCount.length === 0) {
        console.log(`No seasons found for ${seriesRecord.title}, creating seasons and episodes`);
        await createSeasonsAndEpisodes(seriesRecord, animeRecord);
      } else {
        console.log(`Series ${seriesRecord.title} already has ${seasonsCount.length} seasons`);
      }
    }
    await sleep(3000);
  }
  console.log("Series and episodes seed completed!");
}

// --- Main Runner ---

async function main() {
  console.log("Starting combined seed process...");
  await seedContent();
  await seedSeriesAndEpisodes();
  console.log("All done!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error in seed process:", error);
  process.exit(1);
});
