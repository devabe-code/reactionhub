CREATE TABLE "reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text,
	"season_id" text,
	"episode_id" text,
	"season_number" integer NOT NULL,
	"episode" text NOT NULL,
	"title" text NOT NULL,
	"first_link" text NOT NULL,
	"second_link" text NOT NULL,
	"thumbnail" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE no action ON UPDATE no action;