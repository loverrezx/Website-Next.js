import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST: Close a chat session (admin only) — deletes all messages + session
export async function POST(req: NextRequest) {
  try {
    const { sessionId, username } = await req.json();
    if (!sessionId || !username) {
      return NextResponse.json({ error: "sessionId and username required" }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare(`SELECT role FROM users WHERE username = ?`).get(username) as { role: string } | undefined;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isAdmin = user.role !== "Member" && user.role !== "Partner";
    if (!isAdmin) return NextResponse.json({ error: "Permission denied" }, { status: 403 });

    // Delete messages then session (cascade would also work but being explicit)
    db.prepare(`DELETE FROM chat_messages WHERE sessionId = ?`).run(Number(sessionId));
    db.prepare(`DELETE FROM chat_sessions WHERE id = ?`).run(Number(sessionId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
