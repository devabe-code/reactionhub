import { auth } from "@/auth";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";
import { db } from "@/database/drizzle";
import { episodes, reactions, series, watchHistory } from "@/database/schema";
import { desc, eq, ilike, and } from "drizzle-orm";
import { FeaturedContent } from "@/components/HeroSection";
import { getContinueWatching } from "@/lib/actions/user-activity";

const currentReactions = ["One Piece", "Attack on Titan", "Death Note", "Naruto"];

// Helper function to convert reaction to FeaturedContent
const mapReactionToFeaturedContent = (reaction: NonNullable<typeof reactions.$inferSelect>): FeaturedContent => {
  return {
    id: reaction.id,
    title: reaction.title,
    image: reaction.thumbnail,
    description: reaction.episode,
    type: "reaction",
    hasReaction: true,
    reactionId: reaction.id,
    reactionThumbnail: reaction.thumbnail
  };
};

export default async function Home() {
  const session = await auth();
  
  // Get continue watching items if user is logged in
  const continueWatching = session?.user?.id 
    ? await getContinueWatching(session.user.id)
    : [];

  // Filter out completed items from continue watching
  const inProgressItems = continueWatching.filter(item => 
    !item.history.completed && item.reaction // Ensure reaction exists
  );

  const heroReactions: typeof reactions.$inferSelect[] = [];
  const seriesCarousels: { title: string; reactions: typeof reactions.$inferSelect[] }[] = [];
  
  for (const title of currentReactions) {
    const seriesResult = await db
      .select()
      .from(series)
      .where(ilike(series.title, `%${title}%`))
      .limit(1);

    if (seriesResult.length > 0) {
      const s = seriesResult[0];

      const seriesReactions = await db
        .select({
          reaction: reactions,
          episode_air_date: episodes.air_date
        })
        .from(reactions)
        .leftJoin(episodes, eq(reactions.episode_id, episodes.id))
        .where(eq(reactions.series_id, s.id))
        .orderBy(desc(reactions.updatedAt));

      const uniqueMap = new Map();
      for (const r of seriesReactions) {
        const baseId = r.reaction.id.split("-")[0];
        if (!uniqueMap.has(baseId)) {
          uniqueMap.set(baseId, r.reaction);
        }
      }

      const uniqueReactions = Array.from(uniqueMap.values());

      if (uniqueReactions.length > 0) {
        heroReactions.push(uniqueReactions[0]);
      }

      seriesCarousels.push({ title, reactions: uniqueReactions.slice(0, 10) });
    }
  }

  // Map reactions to FeaturedContent for components
  const mappedHeroReactions = heroReactions.map(mapReactionToFeaturedContent);
  const mappedCarousels = seriesCarousels.map(carousel => ({
    title: carousel.title,
    reactions: carousel.reactions.map(mapReactionToFeaturedContent)
  }));

  // Get durations for in-progress items
  const itemsWithDuration = await Promise.all(
    inProgressItems
      .filter(item => item.reaction !== null)
      .map(async (item) => {
        // Use the duration already stored in the database
        const duration = item.reaction?.duration;
        
        return {
          ...(item.reaction ? mapReactionToFeaturedContent(item.reaction) : { id: "", title: "", image: "" }),
          type: "episode" as const,
          progress: item.history.timestamp,
          duration
        };
      })
  );


  return (
    <div className="mx-auto overflow-hidden">
      <div>
        <HeroSection 
          featuredContent={mappedHeroReactions} 
          upcomingContent={mappedHeroReactions} 
        />
      </div>

      <div className="mx-auto max-w-7xl -mt-35 px-4 sm:px-6 lg:px-8">
        {session?.user && inProgressItems.length > 0 && (
          <MovieCarousel 
            items={itemsWithDuration}
            title="Continue Watching" 
          />
        )}
        
        {mappedCarousels.map((carousel) => (
          <div key={carousel.title} className="mb-10">
            <MovieCarousel 
              items={carousel.reactions.map(item => ({ 
                ...item, 
                type: "series" as const,
                duration: typeof item.duration === 'string' 
                  ? parseInt(item.duration) 
                  : item.duration || undefined
              }))} 
              title={carousel.title} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
