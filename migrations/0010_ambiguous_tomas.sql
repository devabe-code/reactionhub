ALTER TABLE "reactions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "series_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "season_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "episode_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "season_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "episode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "first_link" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "second_link" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "thumbnail" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "reactions" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "reactions" DROP COLUMN "created_at";