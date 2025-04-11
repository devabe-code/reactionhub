import { db } from "@/database/drizzle";
import { watchHistory, userLists, userListItems, userNotifications, reactions } from "@/database/schema";
import { eq, and, desc } from "drizzle-orm";

export async function updateWatchProgress(
  userId: string, 
  reactionId: string, 
  timestamp: number,
  completed: boolean = false
) {
  const existing = await db
    .select()
    .from(watchHistory)
    .where(
      and(
        eq(watchHistory.userId, userId),
        eq(watchHistory.reactionId, reactionId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(watchHistory)
      .set({
        timestamp,
        updatedAt: new Date(),
        completed,
      })
      .where(
        and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.reactionId, reactionId)
        )
      )
      .returning();
  }

  return db.insert(watchHistory)
    .values({
      userId,
      reactionId,
      timestamp,
      completed,
    })
    .returning();
}

export async function getContinueWatching(userId: string) {
  return db
    .select({
      history: watchHistory,
      reaction: reactions,
    })
    .from(watchHistory)
    .leftJoin(reactions, eq(watchHistory.reactionId, reactions.id))
    .where(
      and(
        eq(watchHistory.userId, userId),
        eq(watchHistory.completed, false)
      )
    )
    .orderBy(desc(watchHistory.updatedAt))
    .limit(10);
}

export async function toggleFavorite(userId: string, seriesId: string) {
  const favoritesList = await db
    .select()
    .from(userLists)
    .where(
      and(
        eq(userLists.userId, userId),
        eq(userLists.name, "Favorites")
      )
    )
    .limit(1);

  let listId;
  if (favoritesList.length === 0) {
    const [newList] = await db
      .insert(userLists)
      .values({
        userId,
        name: "Favorites",
      })
      .returning();
    listId = newList.id;
  } else {
    listId = favoritesList[0].id;
  }

  const existing = await db
    .select()
    .from(userListItems)
    .where(
      and(
        eq(userListItems.listId, listId),
        eq(userListItems.seriesId, seriesId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return db
      .delete(userListItems)
      .where(eq(userListItems.id, existing[0].id));
  }

  return db.insert(userListItems).values({
    listId,
    seriesId,
  });
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string
) {
  return db.insert(userNotifications).values({
    userId,
    type,
    title,
    message,
    relatedId,
  });
}
