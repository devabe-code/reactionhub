import { auth } from "@/auth"
import { db } from "@/database/drizzle"
import { reactions } from "@/database/schema"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email || session.user.email !== "justanotherartist365@gmail.com") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const {
      series_id,
      season_number,
      season_title,
      episode,
      title,
      first_link,
      second_link,
      thumbnail,
      duration,
    } = body

    const reaction = await db.insert(reactions).values({
      series_id,
      season_number: parseInt(season_number),
      season_title,
      episode,
      title,
      first_link,
      second_link,
      thumbnail,
      duration,
    }).returning()

    return NextResponse.json(reaction[0])
  } catch (error) {
    console.error("[REACTIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 