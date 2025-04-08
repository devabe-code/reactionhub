import { auth } from "@/auth";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import { db } from "@/database/drizzle";
import { reactions, series } from "@/database/schema";
import { desc, eq, ilike } from "drizzle-orm";

const currentReactions = ["One Piece", "Attack on Titan", "Death Note", "Naruto"];

export default async function Home() {
  const session = await auth();

  // For each series in currentReactions, fetch the latest unique reaction for HeroSection
  const heroReactions: typeof reactions.$inferSelect[] = [];
  const seriesCarousels: { title: string; reactions: typeof reactions.$inferSelect[] }[] = [];
  
  for (const title of currentReactions) {
    // Find series by title (using ilike for case-insensitive matching)
    const seriesResult = await db
      .select()
      .from(series)
      .where(ilike(series.title, `%${title}%`))
      .limit(1);

    if (seriesResult.length > 0) {
      const s = seriesResult[0];
      
      // Get reactions for this series
      const reactionsRaw = await db
        .select()
        .from(reactions)
        .where(eq(reactions.series_id, s.id))
        .orderBy(desc(reactions.updatedAt));

      // Create a map of unique reactions (by base ID)
      const uniqueMap = new Map();
      for (const r of reactionsRaw) {
        const baseId = r.id.split("-")[0];
        if (!uniqueMap.has(baseId)) {
          uniqueMap.set(baseId, r);
        }
      }

      const uniqueReactions = Array.from(uniqueMap.values());

      // Push latest reaction for HeroSection
      if (uniqueReactions.length > 0) {
        heroReactions.push(uniqueReactions[0]);
      }

      // Push top 10 to carousel
      seriesCarousels.push({ title, reactions: uniqueReactions.slice(0, 10) });
    }
  }

  return (
    <div className="mx-auto">
      <div>
        <HeroSection featuredContent={heroReactions} upcomingContent={heroReactions} />
      </div>

      <div className="relative bottom-15 md:m-4">
        <MovieCarousel items={heroReactions} title="Continue Watching" />
      </div>

      <div className="mx-auto max-w-7xl -mt-10">
        {seriesCarousels.map((carousel) => (
          <div key={carousel.title} className="mb-10">
            <MovieCarousel items={carousel.reactions} title={carousel.title} />
          </div>
        ))}
      </div>
    </div>
  );
}