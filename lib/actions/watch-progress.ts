'use server'

import { db } from "@/database/drizzle";
import { watchHistory } from "@/database/schema";
import { and, eq } from "drizzle-orm";

export async function updateWatchProgress(
  userId: string,
  reactionId: string,
  timestamp: number,
  completed: boolean = false
) {
  console.log('updateWatchProgress called with:', { userId, reactionId, timestamp, completed });

  if (!userId || !reactionId) {
    console.error('Missing required parameters:', { userId, reactionId });
    return null;
  }

  try {
    console.log('Checking for existing watch history...');
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

    console.log('Existing watch history:', existing);

    let result;
    if (existing.length > 0) {
      console.log('Updating existing watch history...');
      result = await db
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
      console.log('Update result:', result);
    } else {
      console.log('Creating new watch history entry...');
      result = await db.insert(watchHistory).values({
        userId,
        reactionId,
        timestamp,
        completed,
      }).returning();
      console.log('Insert result:', result);
    }

    return result;
  } catch (error) {
    console.error('Failed to update watch progress:', error);
    throw error;
  }
}
