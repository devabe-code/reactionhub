import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { watchHistory, reactions, series } from "@/database/schema";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { HistoryContent } from "@/components/history/HistoryContent";

export default async function WatchHistoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const history = await db
    .select({
      watchHistory: watchHistory,
      reaction: reactions,
      series: series,
    })
    .from(watchHistory)
    .innerJoin(reactions, eq(watchHistory.reactionId, reactions.id))
    .leftJoin(series, eq(reactions.series_id, series.id))
    .where(eq(watchHistory.userId, session.user.id!))
    .orderBy(desc(watchHistory.updatedAt));

  return (
    <div className="container mx-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Watch History</h1>
      <HistoryContent history={history} />
    </div>
  );
}
