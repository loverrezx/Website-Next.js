import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: List all open chat sessions (for admin)
export async function GET() {
  try {
    const db = getDb();
    const sessions = db.prepare(`
      SELECT s.id, s.status, s.createdAt, u.username, u.role,
        (SELECT COUNT(*) FROM chat_messages m WHERE m.sessionId = s.id) as messageCount,
        (SELECT content FROM chat_messages m WHERE m.sessionId = s.id ORDER BY m.createdAt DESC LIMIT 1) as lastMessage,
        (SELECT createdAt FROM chat_messages m WHERE m.sessionId = s.id ORDER BY m.createdAt DESC LIMIT 1) as lastMessageAt
      FROM chat_sessions s
      JOIN users u ON s.userId = u.id
      WHERE s.status = 'open'
      ORDER BY s.createdAt DESC
    `).all();
    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
