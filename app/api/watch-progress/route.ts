// app/api/watch-progress/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/database/drizzle"
import { watchHistory } from "@/database/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/auth"

// GET - Fetch progress
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/watch-progress - Start")
    
    const session = await auth()
    console.log("Session:", session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const reactionId = searchParams.get("reactionId")
    console.log("ReactionId:", reactionId)

    if (!reactionId) {
      return NextResponse.json(
        { error: "Missing reactionId parameter" }, 
        { status: 400 }
      )
    }

    const progress = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, session.user.id),
          eq(watchHistory.reactionId, reactionId)
        )
      )
      .limit(1)

    console.log("Found progress:", progress)
    return NextResponse.json(progress[0] || null)
  } catch (error) {
    console.error("Watch progress error:", error)
    return NextResponse.json(
      { error: "Failed to fetch watch progress", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    )
  }
}

// POST - Save/update progress
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/watch-progress - Start")
    
    const session = await auth()
    console.log("Session:", session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body:", body)
    
    const { reactionId, currentTime, isCompleted = false } = body

    if (!reactionId || typeof currentTime !== 'number') {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      )
    }

    // Check if a record already exists
    const existingProgress = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, session.user.id),
          eq(watchHistory.reactionId, reactionId)
        )
      )
      .limit(1)

    console.log("Existing progress:", existingProgress)

    let result;
    if (existingProgress.length > 0) {
      console.log("Updating existing record")
      result = await db
        .update(watchHistory)
        .set({
          timestamp: currentTime,
          completed: isCompleted,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(watchHistory.userId, session.user.id),
            eq(watchHistory.reactionId, reactionId)
          )
        )
        .returning()
    } else {
      console.log("Creating new record")
      result = await db.insert(watchHistory)
        .values({
          userId: session.user.id,
          reactionId: reactionId,
          timestamp: currentTime,
          completed: isCompleted,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
    }

    console.log("Operation result:", result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Watch progress error:", error)
    return NextResponse.json(
      { error: "Failed to update watch progress", details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    )
  }
}
