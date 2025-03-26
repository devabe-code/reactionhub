ALTER TABLE "reactions" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "reactions" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now();