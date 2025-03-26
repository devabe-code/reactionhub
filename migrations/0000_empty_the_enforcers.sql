CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "anime" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text,
	"mal_id" integer NOT NULL,
	"title_japanese" text,
	"title_english" text,
	"title_synonyms" jsonb,
	"status" text,
	"episodes" integer,
	"duration" text,
	"rating" text,
	"cover_color" varchar(7) NOT NULL,
	"score" integer,
	"scored_by" integer,
	"rank" integer,
	"popularity" integer,
	"members" integer,
	"favorites" integer,
	"synopsis" text,
	"background" text,
	"premiered" text,
	"broadcast" text,
	"producers" jsonb,
	"licensors" jsonb,
	"studios" jsonb,
	"genres" jsonb,
	"explicit_genres" jsonb,
	"themes" jsonb,
	"demographics" jsonb,
	"images" jsonb,
	CONSTRAINT "anime_mal_id_unique" UNIQUE("mal_id")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text,
	"series_id" text,
	"title" text NOT NULL,
	"episode_number" integer NOT NULL,
	"description" text,
	"air_date" date,
	"still_path" text,
	"tmdb_id" integer NOT NULL,
	CONSTRAINT "episodes_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"original_title" text,
	"description" text,
	"release_date" date,
	"runtime" integer,
	"budget" integer,
	"revenue" integer,
	"language" text,
	"poster_path" text,
	"backdrop_path" text,
	"cover_color" varchar(7) NOT NULL,
	"genres" jsonb,
	"production_companies" jsonb,
	"tmdb_id" integer NOT NULL,
	CONSTRAINT "movies_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text,
	"season_number" integer NOT NULL,
	"air_date" date,
	"poster_path" text,
	"overview" text,
	"tmdb_id" integer NOT NULL,
	CONSTRAINT "seasons_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"original_title" text,
	"description" text,
	"first_air_date" date,
	"last_air_date" date,
	"number_of_seasons" integer,
	"number_of_episodes" integer,
	"language" text,
	"poster_path" text,
	"backdrop_path" text,
	"genres" jsonb,
	"cover_color" varchar(7) NOT NULL,
	"production_companies" jsonb,
	"tmdb_id" integer NOT NULL,
	"is_anime" boolean DEFAULT false,
	CONSTRAINT "series_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	"last_activity_date" date DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anime" ADD CONSTRAINT "anime_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;