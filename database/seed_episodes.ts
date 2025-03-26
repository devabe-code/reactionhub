// seed_episodes.ts — Insert One Piece episodes with correct season linkage

import { config } from "dotenv"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { and, eq } from "drizzle-orm"
import { episodes, seasons } from "@/database/schema"

config({ path: ".env.local" })

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient)

const onePieceSeriesId = "2a0c3848-29b0-4a17-a228-5a376ee95718"

async function seedOnePieceEpisodes() {
  console.log("🔍 Seeding One Piece episodes...")

  // Step 1: Fetch all One Piece seasons
  const seasonRecords = await db
    .select({ id: seasons.id, season_number: seasons.season_number })
    .from(seasons)
    .where(eq(seasons.series_id, onePieceSeriesId))

  const seasonMap = new Map<number, string>()
  for (const season of seasonRecords) {
    seasonMap.set(season.season_number, season.id)
  }

  // Step 2: Define episode ranges for each season
  const episodeSeasons: { season: number; range: [number, number] }[] = [
    { season: 1, range: [1, 61] },
    { season: 2, range: [62, 77] },
    { season: 3, range: [78, 91] },
    { season: 4, range: [92, 130] },
    { season: 5, range: [131, 143] },
    { season: 6, range: [144, 195] },
    { season: 7, range: [196, 228] },
    { season: 8, range: [229, 263] },
    { season: 9, range: [264, 336] },
    { season: 10, range: [337, 381] },
    { season: 11, range: [382, 405] },
    { season: 12, range: [406, 429] },
    { season: 13, range: [430, 456] },
    { season: 14, range: [457, 516] },
    { season: 15, range: [517, 574] },
    { season: 16, range: [575, 628] },
    { season: 17, range: [629, 746] },
    { season: 18, range: [747, 782] },
    { season: 19, range: [783, 891] },
    { season: 20, range: [892, 1090] },
  ]

  // Step 3: Insert episodes
  for (const { season, range } of episodeSeasons) {
    const seasonId = seasonMap.get(season)
    if (!seasonId) {
      console.warn(`⚠️ Season ${season} not found for One Piece.`)
      continue
    }

    for (let i = range[0]; i <= range[1]; i++) {
      const title = `Episode ${i}`
      const airDate = null // You could fetch this from TMDB if needed

      await db.insert(episodes).values({
        id: crypto.randomUUID(),
        series_id: onePieceSeriesId,
        season_id: seasonId,
        episode_number: i,
        title,
        description: `One Piece Episode ${i}`,
        air_date: airDate,
        still_path: "",
        tmdb_id: i, // Replace with actual TMDB episode ID if available
        anime_title: "One Piece",
      }).onConflictDoNothing()
    }

    console.log(`✅ Inserted episodes ${range[0]} to ${range[1]} for Season ${season}`)
  }

  console.log("🎉 All One Piece episodes seeded with correct season links.")
}

seedOnePieceEpisodes()
  .then(() => {
    console.log("✅ Done.")
    process.exit(0)
  })
  .catch((err) => {
    console.error("❌ Error:", err)
    process.exit(1)
  })
