import { readdir, readFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, ilike, or, and, inArray } from "drizzle-orm";
import {
  series,
  seasons,
  episodes,
  reactions,
  anime
} from "./schema";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const reactionDataDir = path.join(process.cwd(), "lib", "reaction_data");
// Series that use global episode numbering across seasons
const GLOBAL_EPISODE_SERIES = ["one_piece", "hunter_x_hunter", "naruto"];

// Series name mappings (filename key to possible database names)
const SERIES_NAME_MAP: Record<string, string[]> = {
  "death_note": ["Death Note", "デスノート"],
  "attack_on_titan": ["Attack on Titan", "Shingeki no Kyojin", "進撃の巨人"],
  "haikyuu": ["Haikyuu!!", "ハイキュー!!"],
  "one_piece": ["One Piece", "ワンピース"],
  "hunter_x_hunter": ["Hunter x Hunter", "Hunter × Hunter", "ハンター×ハンター"],
  "naruto": ["Naruto", "ナルト"]
};

// Season name to number mapping
const SEASON_NAME_MAP: Record<string, number> = {
  "season_one": 1,
  "season_two": 2,
  "season_three": 3,
  "season_four": 4,
  "season_five": 5,
  "season1": 1,
  "season2": 2,
  "season3": 3,
  "season4": 4,
  "season5": 5,
  "s1": 1,
  "s2": 2,
  "s3": 3,
  "s4": 4,
  "s5": 5,
  // Add One Piece arc mappings
  "alabasta": 4,
  "skypiea": 5, // spans 5 & 6, assign to first season
  "water_7": 7, // spans 7, 8, 9
  "thriller_bark": 10,
  "summit_war": 11, // spans 11, 12, 13
  "fishman_island": 15,
  "punk_hazard": 16,
  "dressrosa": 17,
  "zou": 18,
  "whole_cake": 19,
  "reverie": 20,
  "wano": 21,

  // Optional aliases for flexibility
  "water7": 7,
  "whole_cake_island": 19,
  "wano_country": 21,

  // Add Hunter x Hunter arc mappings
  "hunter_exam": 1,
  "zoldyck_family": 1,
  "heavens_arena": 1,
  "yorknew_city": 1,
  "greed_island": 2,
  "chimera_ant": 2,
  "election": 3,
  // Add Naruto arc mappings
  "introduction": 1,
  "land_of_waves": 1,
  "chunin_exams": 2,
  "konoha_crush": 3,
  "search_for_tsunade": 4,
  "sasuke_recovery": 5,
  "kazekage_rescue": 6,
  "tenchi_bridge": 7,
  "akatsuki_suppression": 8,
  "itachi_pursuit": 9,
  "pain": 10,
  "five_kage_summit": 11,
  "fourth_shinobi_war": 12,
};

// Arc to episode range mapping for series with global numbering
const ARC_EPISODE_RANGES: Record<string, Record<string, [number, number]>> = {
  "one_piece": {
    "east_blue": [1, 61],
    "alabasta": [62, 135],
    "skypiea": [136, 206],
    "water_7": [207, 325],
    "thriller_bark": [326, 384],
    "summit_war": [385, 516],
    "fishman_island": [517, 574],
    "punk_hazard": [575, 628],
    "dressrosa": [629, 746],
    "zou": [747, 782],
    "whole_cake_island": [783, 877],
    "reverie": [878, 889],
    "wano": [890, 1085],
    "egghead": [1086, 1122], // Approximate, update as needed
  },
  "hunter_x_hunter": {
    "hunter_exam": [1, 21],
    "zoldyck_family": [22, 26],
    "heavens_arena": [27, 36],
    "yorknew_city": [37, 58],
    "greed_island": [59, 75],
    "chimera_ant": [76, 136],
    "election": [137, 148],
  },
  "naruto": {
    "introduction": [1, 5],
    "land_of_waves": [6, 19],
    "chunin_exams": [20, 67],
    "konoha_crush": [68, 80],
    "search_for_tsunade": [81, 100],
    "sasuke_recovery": [101, 135],
    // Add more arcs as needed
  }
};

function formatSeasonTitle(filename: string) {
  return filename.replace(/\.json$/, "").split(".").slice(1).join(".").replace(/_/g, " ");
}

function extractSeriesKey(filename: string): string {
  return filename.split(".")[0];
}

// Parse episode numbers from strings like "Episode 59 60 61" or "Episode 1"
function parseEpisodeNumbers(episodeString: string): number[] {
  // Extract all numbers from the string
  const numbers = (episodeString.match(/\d+/g) || []).map(n => parseInt(n));
  
  if (numbers.length === 0) {
    return [];
  }
  
  // Check if we have a range (e.g., "Episodes 59-61")
  if (episodeString.includes("-")) {
    const [start, end] = numbers;
    if (start && end && end > start && (end - start) < 100) { // Sanity check for range size
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }
  
  // Check if we have multiple consecutive episodes (e.g., "Episode 59 60 61")
  if (numbers.length > 1) {
    // Check if they form a sequence
    const isSequence = numbers.every((num, i) => 
      i === 0 || num === numbers[i-1] + 1
    );
    
    if (isSequence) {
      return numbers;
    }
  }
  
  // Return the numbers as is if they don't form a sequence
  return numbers;
}

function extractSeasonNumberFromTitle(title: string, seriesKey: string): number {
  // First check if we have a direct mapping for the season name
  const seasonPart = title.split(".")[1]?.toLowerCase();
  if (seasonPart && SEASON_NAME_MAP[seasonPart]) {
    return SEASON_NAME_MAP[seasonPart];
  }
  
  // Check for season_two, season_three, etc. patterns
  const seasonNameMatch = title.match(/season[_\s]*(one|two|three|four|five)/i);
  if (seasonNameMatch) {
    const seasonName = seasonNameMatch[1].toLowerCase();
    const seasonMap: Record<string, number> = {
      "one": 1, "two": 2, "three": 3, "four": 4, "five": 5
    };
    return seasonMap[seasonName] || 1;
  }
  
  // Check for arc names in global episode series
  if (GLOBAL_EPISODE_SERIES.includes(seriesKey) && seasonPart) {
    // Check if the arc name is in our mapping
    for (const [arc, seasonNum] of Object.entries(SEASON_NAME_MAP)) {
      if (seasonPart.includes(arc)) {
        return seasonNum;
      }
    }
  }
  
  // Fall back to looking for a number
  const match = title.match(/season[_\s]*(\d+)/i) || title.match(/s(\d+)/i) || title.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

async function findSeriesByKey(seriesKey: string): Promise<any | null> {
  // Check if we have specific mappings for this series
  const possibleNames = SERIES_NAME_MAP[seriesKey] || [seriesKey.replace(/_/g, " ")];
  
  console.log(`Looking for series with possible names: ${possibleNames.join(", ")}`);
  
  // Build a query to match any of the possible names
  const conditions = possibleNames.map(name => ilike(series.title, `%${name}%`));
  const seriesRecords = await db.select().from(series).where(or(...conditions));
  
  if (seriesRecords.length > 0) {
    console.log(`Found series: ${seriesRecords[0].title} (ID: ${seriesRecords[0].id})`);
    return seriesRecords[0];
  }
  
  // If not found in series table, try the anime table
  console.log(`Series not found in series table, checking anime table...`);
  const animeConditions = possibleNames.map(name => 
    or(
      ilike(anime.title, `%${name}%`),
      ilike(anime.title_english, `%${name}%`),
      ilike(anime.title_japanese, `%${name}%`)
    )
  );
  
  const animeRecords = await db.select().from(anime).where(or(...animeConditions));
  
  if (animeRecords.length > 0) {
    console.log(`Found anime: ${animeRecords[0].title} (ID: ${animeRecords[0].id}, MAL ID: ${animeRecords[0].mal_id})`);
    
    // Now find the corresponding series
    const animeSeriesRecords = await db.select()
      .from(series)
      .where(eq(series.is_anime, true));
    
    // Find the best match by comparing titles
    let bestMatch = null;
    let bestMatchScore = 0;
    
    for (const seriesRecord of animeSeriesRecords) {
      for (const possibleName of possibleNames) {
        const seriesTitle = seriesRecord.title.toLowerCase();
        const nameToMatch = possibleName.toLowerCase();
        
        if (seriesTitle.includes(nameToMatch) || nameToMatch.includes(seriesTitle)) {
          const score = Math.max(seriesTitle.length, nameToMatch.length);
          if (score > bestMatchScore) {
            bestMatchScore = score;
            bestMatch = seriesRecord;
          }
        }
      }
    }
    
    if (bestMatch) {
      console.log(`Found matching series: ${bestMatch.title} (ID: ${bestMatch.id})`);
      return bestMatch;
    }
  }
  
  console.warn(`❌ Series not found for ${seriesKey}`);
  return null;
}

// Find the appropriate season for an episode in a global numbering series
async function findSeasonForGlobalEpisode(
  seriesId: string, 
  episodeNumber: number, 
  seriesKey: string, 
  seasonTitle: string
): Promise<{ seasonId: string, seasonNumber: number } | null> {
  // Get all seasons for this series
  const seasonRecords = await db.select().from(seasons).where(eq(seasons.series_id, seriesId));
  
  if (seasonRecords.length === 0) {
    console.warn(`No seasons found for series ID ${seriesId}`);
    return null;
  }
  
  // Try to find the season by checking episode ranges in ARC_EPISODE_RANGES
  if (seriesKey in ARC_EPISODE_RANGES) {
    const arcRanges = ARC_EPISODE_RANGES[seriesKey];
    
    // First try to match by season title
    const normalizedSeasonTitle = seasonTitle.toLowerCase().replace(/\s+/g, '_');
    
    for (const [arc, [start, end]] of Object.entries(arcRanges)) {
      if (normalizedSeasonTitle.includes(arc) && episodeNumber >= start && episodeNumber <= end) {
        // Found a matching arc by name and episode is in range
        const seasonNumber = SEASON_NAME_MAP[arc] || 1;
        const seasonRecord = seasonRecords.find(s => s.season_number === seasonNumber);
        
        if (seasonRecord) {
          return { seasonId: seasonRecord.id, seasonNumber };
        }
      }
    }
    
    // If no match by name, just check episode ranges
    for (const [arc, [start, end]] of Object.entries(arcRanges)) {
      if (episodeNumber >= start && episodeNumber <= end) {
        const seasonNumber = SEASON_NAME_MAP[arc] || 1;
        const seasonRecord = seasonRecords.find(s => s.season_number === seasonNumber);
        
        if (seasonRecord) {
          return { seasonId: seasonRecord.id, seasonNumber };
        }
      }
    }
  }
  
  // Fallback: try to find the season by querying episodes
  const episodeRecord = await db.select()
    .from(episodes)
    .where(and(
      eq(episodes.series_id, seriesId),
      eq(episodes.episode_number, episodeNumber)
    ))
    .limit(1);
  
  if (episodeRecord.length > 0) {
    const seasonId = episodeRecord[0].season_id;
    const seasonRecord = seasonRecords.find(s => s.id === seasonId);
    
    if (seasonRecord) {
      return { seasonId, seasonNumber: seasonRecord.season_number };
    }
  }
  
  // Last resort: just use the first season
  if (seasonRecords.length > 0) {
    console.warn(`⚠️ Could not determine season for episode ${episodeNumber}, using first season`);
    return { seasonId: seasonRecords[0].id, seasonNumber: seasonRecords[0].season_number };
  }
  
  return null;
}

async function seedReactions() {
  console.log("📦 Seeding reactions...");
  const files = await readdir(reactionDataDir);

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const seriesKey = extractSeriesKey(file);
    const seasonTitle = formatSeasonTitle(file);
    
    console.log(`\n=== Processing ${file} ===`);
    
    const isGlobalNumbering = GLOBAL_EPISODE_SERIES.includes(seriesKey);

    // Find the series in the database using our enhanced lookup
    const seriesRecord = await findSeriesByKey(seriesKey);
    
    if (!seriesRecord) {
      continue; // Series not found, skip this file
    }

    const seriesId = seriesRecord.id;

    // Get all seasons for this series
    const seasonRecords = await db.select().from(seasons).where(eq(seasons.series_id, seriesId));
    
    if (seasonRecords.length === 0) {
      console.warn(`❌ No seasons found for series ${seriesRecord.title} (ID: ${seriesId})`);
      continue;
    }
    
    // Log available seasons for debugging
    console.log(`Available seasons for ${seriesRecord.title}:`, 
      seasonRecords.map(s => `Season ${s.season_number} (ID: ${s.id})`).join(", "));

    // Get all episodes for this series
    const episodeRecords = await db.select().from(episodes).where(eq(episodes.series_id, seriesId));
    
    if (episodeRecords.length === 0) {
      console.warn(`❌ No episodes found for series ${seriesRecord.title} (ID: ${seriesId})`);
      continue;
    }
    
    // Log episode count for debugging
    console.log(`Found ${episodeRecords.length} episodes for ${seriesRecord.title}`);

    // Read the reaction data from the JSON file
    const data = JSON.parse(await readFile(path.join(reactionDataDir, file), "utf-8"));

    // Try to determine the season number from the filename
    const seasonNumberGuess = extractSeasonNumberFromTitle(file, seriesKey);
    console.log(`Extracted season number ${seasonNumberGuess} from ${file}`);
    
    // Special handling for Death Note and Attack on Titan - they might only have one season
    let seasonIdToUse;
    let seasonNumberToUse;
    
    if ((seriesKey === "death_note" || seriesKey === "attack_on_titan") && seasonRecords.length === 1) {
      // If there's only one season, use it regardless of the season number in the filename
      seasonIdToUse = seasonRecords[0].id;
      seasonNumberToUse = seasonRecords[0].season_number;
      console.log(`Special handling: Using the only available season (${seasonNumberToUse}) for ${seriesRecord.title}`);
    } else {
      // Normal handling - try to find the season by number
      const seasonRecord = seasonRecords.find(s => s.season_number === seasonNumberGuess);
      
      if (seasonRecord) {
        seasonIdToUse = seasonRecord.id;
        seasonNumberToUse = seasonNumberGuess;
      } else {
        console.warn(`⚠️ Season ${seasonNumberGuess} not found for ${seriesRecord.title}. Available seasons: ${seasonRecords.map(s => s.season_number).join(", ")}`);
        
        // Fall back to the first season
        seasonIdToUse = seasonRecords[0].id;
        seasonNumberToUse = seasonRecords[0].season_number;
        console.log(`Falling back to Season ${seasonNumberToUse} (ID: ${seasonIdToUse})`);
      }
    }

    await processReactionsForSeason(
      data, 
      seriesId, 
      seasonIdToUse, 
      seasonNumberToUse, 
      episodeRecords, 
      seasonTitle, 
      file, 
      seriesRecord.title, 
      isGlobalNumbering,
      seriesKey
    );

    console.log(`✅ Seeded reactions from ${file}`);
  }

  console.log("🎉 All reactions successfully seeded.");
}

async function processReactionsForSeason(
  data: any[], 
  seriesId: string, 
  seasonId: string, 
  seasonNumber: number,
  episodeRecords: any[],
  seasonTitle: string,
  file: string,
  seriesTitle: string,
  isGlobalNumbering: boolean,
  seriesKey: string
) {
  // Get episodes for this specific season
  const seasonEpisodes = episodeRecords.filter(e => e.season_id === seasonId);
  console.log(`Found ${seasonEpisodes.length} episodes for Season ${seasonNumber}`);
  
  // Log episode numbers for debugging
  if (seasonEpisodes.length > 0) {
    const episodeNumbers = seasonEpisodes.map(e => e.episode_number).sort((a, b) => a - b);
    console.log(`Episode numbers in Season ${seasonNumber}: ${episodeNumbers.join(", ")}`);
  }

  for (const reaction of data) {
    const rawEpisode = reaction.episode ?? "";
    const firstLink = reaction["first-link"];
    const secondLink = reaction["second-link"];
    const thumbnail = reaction["thumbnail"];
    const title = reaction.title;

    if (!firstLink || !secondLink || !thumbnail) {
      console.warn(`⚠️ Skipping due to missing links in ${file}: ${title}`);
      continue;
    }

    // Parse episode numbers from the episode string
    const episodeNumbers = parseEpisodeNumbers(rawEpisode);
    
    if (episodeNumbers.length === 0) {
      console.warn(`⚠️ Could not parse episode number(s) from "${rawEpisode}" in ${file}`);
      continue;
    }

    console.log(`Processing reaction "${title}" for episodes: ${episodeNumbers.join(", ")}`);

    for (const episodeNumber of episodeNumbers) {
      let episodeMatch;
      let episodeSeason = { seasonId, seasonNumber };

      if (isGlobalNumbering) {
        // For global numbering series, we need to find which season this episode belongs to
        const seasonInfo = await findSeasonForGlobalEpisode(seriesId, episodeNumber, seriesKey, seasonTitle);
        
        if (seasonInfo) {
          episodeSeason = seasonInfo;
        }
        
        // Find the episode by its global number
        episodeMatch = episodeRecords.find(e => e.episode_number === episodeNumber);
      } else {
        // First try to find the episode in the current season
        episodeMatch = seasonEpisodes.find(e => e.episode_number === episodeNumber);
        
        if (!episodeMatch) {
          // If not found, try all episodes for this series
          episodeMatch = episodeRecords.find(
            e => e.episode_number === episodeNumber && 
                (e.season_id === seasonId || e.season_number === seasonNumber)
          );
        }
      }
      
      if (!episodeMatch) {
        console.warn(`⚠️ Episode ${episodeNumber} not found for ${seriesTitle} in ${isGlobalNumbering ? 'global' : 'season'} numbering`);
        continue;
      }

      try {
        // Insert the reaction record
        await db.insert(reactions).values({
          series_id: seriesId,
          season_id: episodeSeason.seasonId,
          episode_id: episodeMatch.id,
          season_number: episodeSeason.seasonNumber,
          season_title: seasonTitle,
          episode: `Episode ${episodeNumber}`,
          title: title,
          first_link: firstLink,
          second_link: secondLink,
          thumbnail: thumbnail,
        });

        console.log(`✅ Added reaction: "${title}" for ${seriesTitle} S${episodeSeason.seasonNumber} E${episodeNumber}`);
      } catch (error) {
        console.error(`❌ Error inserting reaction for ${seriesTitle} S${episodeSeason.seasonNumber} E${episodeNumber}:`, error);
      }
    }
  }
}

// Main execution
seedReactions()
  .then(() => {
    console.log("✅ Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });