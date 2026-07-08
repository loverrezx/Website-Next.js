import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: Get or create a chat session for the user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    const db = getDb();
    const user = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username) as { id: number } | undefined;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const session = db.prepare(`
      SELECT id, status, createdAt FROM chat_sessions
      WHERE userId = ? AND status = 'open' ORDER BY createdAt DESC LIMIT 1
    `).get(user.id) as { id: number; status: string; createdAt: string } | undefined;

    return NextResponse.json({ session: session ?? null });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create new session
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

    const db = getDb();
    const user = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username) as { id: number } | undefined;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Close any existing open session first
    db.prepare(`UPDATE chat_sessions SET status = 'closed' WHERE userId = ? AND status = 'open'`).run(user.id);

    const result = db.prepare(`INSERT INTO chat_sessions (userId) VALUES (?)`).run(user.id);
    const session = db.prepare(`SELECT id, status, createdAt FROM chat_sessions WHERE id = ?`).get(result.lastInsertRowid);
    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
