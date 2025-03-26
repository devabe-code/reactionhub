CREATE TYPE "public"."anime_season" AS ENUM('winter', 'spring', 'summer', 'fall');--> statement-breakpoint
CREATE TYPE "public"."anime_status" AS ENUM('Finished Airing', 'Currently Airing', 'Not yet aired');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music');--> statement-breakpoint
CREATE TYPE "public"."movie_status" AS ENUM('Rumored', 'Planned', 'In Production', 'Post Production', 'Released', 'Canceled');--> statement-breakpoint
CREATE TABLE "anime_external" (
	"anime_id" text,
	"name" text,
	"url" text
);
--> statement-breakpoint
CREATE TABLE "anime_genres" (
	"anime_id" text,
	"genre_id" integer,
	CONSTRAINT "anime_genres_anime_id_genre_id_pk" PRIMARY KEY("anime_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "anime_relations" (
	"anime_id" text,
	"related_mal_id" integer,
	"relation_type" text,
	"related_type" text,
	"related_name" text,
	CONSTRAINT "anime_relations_anime_id_related_mal_id_pk" PRIMARY KEY("anime_id","related_mal_id")
);
--> statement-breakpoint
CREATE TABLE "anime_streaming" (
	"anime_id" text,
	"name" text,
	"url" text
);
--> statement-breakpoint
CREATE TABLE "anime_themes" (
	"anime_id" text,
	"type" text,
	"theme" text
);
--> statement-breakpoint
CREATE TABLE "character_anime_roles" (
	"character_id" text,
	"anime_id" text,
	"role" text
);
--> statement-breakpoint
CREATE TABLE "character_manga_roles" (
	"character_id" text,
	"manga_id" text,
	"role" text
);
--> statement-breakpoint
CREATE TABLE "character_voices" (
	"character_id" text,
	"language" text,
	"person_id" text
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"mal_id" integer NOT NULL,
	"name" text NOT NULL,
	"name_kanji" text,
	"nicknames" jsonb,
	"favorites" integer,
	"about" text,
	"images" jsonb,
	CONSTRAINT "characters_mal_id_unique" UNIQUE("mal_id")
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manga" (
	"id" text PRIMARY KEY NOT NULL,
	"mal_id" integer NOT NULL,
	"title" text NOT NULL,
	"title_japanese" text,
	"title_english" text,
	"title_synonyms" jsonb,
	"type" text,
	"status" text,
	"chapters" integer,
	"volumes" integer,
	"publishing" boolean,
	"score" integer,
	"scored_by" integer,
	"rank" integer,
	"popularity" integer,
	"members" integer,
	"favorites" integer,
	"synopsis" text,
	"background" text,
	"published_from" date,
	"published_to" date,
	"images" jsonb,
	"authors" jsonb,
	"serializations" jsonb,
	"external" jsonb,
	CONSTRAINT "manga_mal_id_unique" UNIQUE("mal_id")
);
--> statement-breakpoint
CREATE TABLE "manga_genres" (
	"manga_id" text,
	"genre_id" integer,
	CONSTRAINT "manga_genres_manga_id_genre_id_pk" PRIMARY KEY("manga_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" text PRIMARY KEY NOT NULL,
	"mal_id" integer NOT NULL,
	"name" text,
	"given_name" text,
	"family_name" text,
	"alternate_names" jsonb,
	"birthday" date,
	"favorites" integer,
	"about" text,
	"website_url" text,
	"images" jsonb,
	CONSTRAINT "people_mal_id_unique" UNIQUE("mal_id")
);
--> statement-breakpoint
CREATE TABLE "person_anime_roles" (
	"person_id" text,
	"anime_id" text,
	"position" text
);
--> statement-breakpoint
CREATE TABLE "person_manga_roles" (
	"person_id" text,
	"manga_id" text,
	"position" text
);
--> statement-breakpoint
CREATE TABLE "person_voice_roles" (
	"person_id" text,
	"character_id" text,
	"anime_id" text,
	"role" text
);
--> statement-breakpoint
ALTER TABLE "anime" DROP CONSTRAINT "anime_series_id_series_id_fk";
--> statement-breakpoint
ALTER TABLE "anime" ALTER COLUMN "status" SET DATA TYPE anime_status;--> statement-breakpoint
ALTER TABLE "anime" ALTER COLUMN "broadcast" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "type" "media_type";--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "airing" boolean;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "season" "anime_season";--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "approved" boolean;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "aired_from" date;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "aired_to" date;--> statement-breakpoint
ALTER TABLE "anime" ADD COLUMN "trailer" jsonb;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "season_number" integer;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "runtime" integer;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "vote_average" integer;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "vote_count" integer;--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "production_code" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "status" "movie_status";--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "imdb_id" text;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "popularity" integer;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "vote_average" integer;--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "vote_count" integer;--> statement-breakpoint
ALTER TABLE "series" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "anime_external" ADD CONSTRAINT "anime_external_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_genres" ADD CONSTRAINT "anime_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_relations" ADD CONSTRAINT "anime_relations_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_streaming" ADD CONSTRAINT "anime_streaming_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime_themes" ADD CONSTRAINT "anime_themes_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_anime_roles" ADD CONSTRAINT "character_anime_roles_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_anime_roles" ADD CONSTRAINT "character_anime_roles_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_manga_roles" ADD CONSTRAINT "character_manga_roles_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_manga_roles" ADD CONSTRAINT "character_manga_roles_manga_id_manga_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."manga"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_voices" ADD CONSTRAINT "character_voices_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_voices" ADD CONSTRAINT "character_voices_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_genres" ADD CONSTRAINT "manga_genres_manga_id_manga_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."manga"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manga_genres" ADD CONSTRAINT "manga_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_anime_roles" ADD CONSTRAINT "person_anime_roles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_anime_roles" ADD CONSTRAINT "person_anime_roles_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_manga_roles" ADD CONSTRAINT "person_manga_roles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_manga_roles" ADD CONSTRAINT "person_manga_roles_manga_id_manga_id_fk" FOREIGN KEY ("manga_id") REFERENCES "public"."manga"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_voice_roles" ADD CONSTRAINT "person_voice_roles_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_voice_roles" ADD CONSTRAINT "person_voice_roles_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_voice_roles" ADD CONSTRAINT "person_voice_roles_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "public"."anime"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "series_id";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "premiered";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "producers";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "licensors";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "studios";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "genres";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "explicit_genres";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "themes";--> statement-breakpoint
ALTER TABLE "anime" DROP COLUMN "demographics";