import {
  pgTable,
  text,
  varchar,
  jsonb,
  boolean,
  integer,
  timestamp,
  date,
  serial,
  primaryKey,
  pgEnum
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// Enums
export const mediaTypeEnum = pgEnum("media_type", ["TV", "Movie", "OVA", "ONA", "Special", "Music"]);
export const animeStatusEnum = pgEnum("anime_status", ["Finished Airing", "Currently Airing", "Not yet aired"]);
export const animeSeasonEnum = pgEnum("anime_season", ["winter", "spring", "summer", "fall"]);
export const movieStatusEnum = pgEnum("movie_status", ["Rumored", "Planned", "In Production", "Post Production", "Released", "Canceled"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
  lastActivityDate: date("last_activity_date").defaultNow(),
});

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => [
  {
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  },
]);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const authenticators = pgTable("authenticator", {
  credentialID: text("credentialID").notNull().unique(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerAccountId: text("providerAccountId").notNull(),
  credentialPublicKey: text("credentialPublicKey").notNull(),
  counter: integer("counter").notNull(),
  credentialDeviceType: text("credentialDeviceType").notNull(),
  credentialBackedUp: boolean("credentialBackedUp").notNull(),
  transports: text("transports"),
}, (authenticator) => [
  {
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  },
]);


// Anime (with enums, streaming, themes, relations)
export const anime = pgTable("anime", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  mal_id: integer("mal_id").notNull().unique(),
  title: text("title").notNull(),
  title_japanese: text("title_japanese"),
  title_english: text("title_english"),
  title_synonyms: jsonb("title_synonyms"),
  type: mediaTypeEnum("type"),
  source: text("source"),
  status: animeStatusEnum("status"),
  airing: boolean("airing"),
  episodes: integer("episodes"),
  duration: text("duration"),
  rating: text("rating"),
  season: animeSeasonEnum("season"),
  year: integer("year"),
  score: integer("score"),
  scored_by: integer("scored_by"),
  rank: integer("rank"),
  popularity: integer("popularity"),
  members: integer("members"),
  favorites: integer("favorites"),
  synopsis: text("synopsis"),
  background: text("background"),
  approved: boolean("approved"),
  aired_from: date("aired_from"),
  aired_to: date("aired_to"),
  broadcast: jsonb("broadcast"),
  trailer: jsonb("trailer"),
  images: jsonb("images"),
  coverColor: varchar("cover_color", { length: 7 }).notNull(),
});

// Manga
export const manga = pgTable("manga", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  mal_id: integer("mal_id").notNull().unique(),
  title: text("title").notNull(),
  title_japanese: text("title_japanese"),
  title_english: text("title_english"),
  title_synonyms: jsonb("title_synonyms"),
  type: text("type"),
  status: text("status"),
  chapters: integer("chapters"),
  volumes: integer("volumes"),
  publishing: boolean("publishing"),
  score: integer("score"),
  scored_by: integer("scored_by"),
  rank: integer("rank"),
  popularity: integer("popularity"),
  members: integer("members"),
  favorites: integer("favorites"),
  synopsis: text("synopsis"),
  background: text("background"),
  published_from: date("published_from"),
  published_to: date("published_to"),
  images: jsonb("images"),
  authors: jsonb("authors"),
  serializations: jsonb("serializations"),
  coverColor: varchar("cover_color", { length: 7 }).notNull(),
  external: jsonb("external"),
});

// Characters
export const characters = pgTable("characters", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  mal_id: integer("mal_id").notNull().unique(),
  name: text("name").notNull(),
  name_kanji: text("name_kanji"),
  nicknames: jsonb("nicknames"),
  favorites: integer("favorites"),
  about: text("about"),
  images: jsonb("images"),
});

// TMDB: Movies
export const movies = pgTable("movies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tmdb_id: integer("tmdb_id").notNull().unique(),
  title: text("title").notNull(),
  original_title: text("original_title"),
  description: text("description"),
  tagline: text("tagline"),
  release_date: date("release_date"),
  runtime: integer("runtime"),
  budget: integer("budget"),
  revenue: integer("revenue"),
  language: text("language"),
  status: movieStatusEnum("status"),
  poster_path: text("poster_path"),
  backdrop_path: text("backdrop_path"),
  imdb_id: text("imdb_id"),
  popularity: integer("popularity"),
  vote_average: integer("vote_average"),
  vote_count: integer("vote_count"),
  coverColor: varchar("cover_color", { length: 7 }).notNull(),
  genres: jsonb("genres"),
  production_companies: jsonb("production_companies"),
});

// TMDB: Series, Seasons, Episodes
export const series = pgTable("series", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tmdb_id: integer("tmdb_id").unique(),
  title: text("title").notNull(),
  original_title: text("original_title"),
  description: text("description"),
  first_air_date: date("first_air_date"),
  last_air_date: date("last_air_date"),
  number_of_seasons: integer("number_of_seasons"),
  number_of_episodes: integer("number_of_episodes"),
  language: text("language"),
  status: text("status"),
  poster_path: text("poster_path"),
  backdrop_path: text("backdrop_path"),
  coverColor: varchar("cover_color", { length: 7 }).notNull(),
  production_companies: jsonb("production_companies"),
  genres: jsonb("genres"),
  is_anime: boolean("is_anime").default(false),
});

export const seasons = pgTable("seasons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  series_id: text("series_id").references(() => series.id),
  season_number: integer("season_number").notNull(),
  air_date: date("air_date"),
  poster_path: text("poster_path"),
  overview: text("overview"),
  tmdb_id: integer("tmdb_id").notNull().unique(),
});

export const episodes = pgTable("episodes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  series_id: text("series_id").references(() => series.id),
  season_id: text("season_id").references(() => seasons.id),
  tmdb_id: integer("tmdb_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  air_date: date("air_date"),
  episode_number: integer("episode_number").notNull(),
  season_number: integer("season_number"),
  still_path: text("still_path"),
  runtime: integer("runtime"),
  vote_average: integer("vote_average"),
  vote_count: integer("vote_count"),
  production_code: text("production_code"),
});

// Reactions table
export const reactions = pgTable("reactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  series_id: text("series_id").references(() => series.id),
  season_id: text("season_id").references(() => seasons.id),
  episode_id: text("episode_id").references(() => episodes.id),
  season_number: integer("season_number").notNull(),
  season_title: text("season_title"),
  episode: text("episode").notNull(),
  title: text("title").notNull(),
  first_link: text("first_link").notNull(),
  second_link: text("second_link").notNull(),
  thumbnail: text("thumbnail").notNull(),
  duration: integer("duration"), // Store video duration in seconds
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// User Watch History
export const watchHistory = pgTable("watch_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  reactionId: text("reactionId").notNull().references(() => reactions.id, { onDelete: "cascade" }),
  timestamp: integer("timestamp").notNull().default(0), // Store video progress in seconds
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

// User Lists/Favorites
export const userLists = pgTable("user_lists", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Favorites", "Watch Later", etc.
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});

export const userListItems = pgTable("user_list_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  listId: text("listId").notNull().references(() => userLists.id, { onDelete: "cascade" }),
  seriesId: text("seriesId").references(() => series.id, { onDelete: "cascade" }),
  animeId: text("animeId").references(() => anime.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

// User Notifications
export const userNotifications = pgTable("user_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., "new_reaction", "new_episode"
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  relatedId: text("relatedId"), // ID of related content (reaction, series, etc.)
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});
