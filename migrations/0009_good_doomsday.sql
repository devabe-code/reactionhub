ALTER TABLE "reactions" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "series_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "season_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "episode_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "season_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "episode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "first_link" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "second_link" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ALTER COLUMN "thumbnail" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "reactions" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "reactions" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "reactions" DROP COLUMN "updatedAt";