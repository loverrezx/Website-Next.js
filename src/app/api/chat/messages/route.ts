import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: Fetch messages for a session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const since = searchParams.get("since"); // message id — fetch newer than this
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const db = getDb();
    const session = db.prepare(`SELECT id, status FROM chat_sessions WHERE id = ?`).get(Number(sessionId));
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const messages = since
      ? db.prepare(`
          SELECT m.id, m.senderId, m.senderRole, m.content, m.type, m.createdAt, u.username as senderName
          FROM chat_messages m LEFT JOIN users u ON m.senderId = u.id
          WHERE m.sessionId = ? AND m.id > ?
          ORDER BY m.createdAt ASC
        `).all(Number(sessionId), Number(since))
      : db.prepare(`
          SELECT m.id, m.senderId, m.senderRole, m.content, m.type, m.createdAt, u.username as senderName
          FROM chat_messages m LEFT JOIN users u ON m.senderId = u.id
          WHERE m.sessionId = ?
          ORDER BY m.createdAt ASC
        `).all(Number(sessionId));

    return NextResponse.json({ messages, session });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(req: NextRequest) {
  try {
    const { sessionId, username, content, type = "text" } = await req.json();
    if (!sessionId || !username || !content) {
      return NextResponse.json({ error: "sessionId, username, content required" }, { status: 400 });
    }

    const db = getDb();
    const session = db.prepare(`SELECT id, status FROM chat_sessions WHERE id = ?`).get(Number(sessionId)) as { id: number; status: string } | undefined;
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (session.status === "closed") return NextResponse.json({ error: "Chat is closed" }, { status: 400 });

    const user = db.prepare(`SELECT id, role FROM users WHERE username = ?`).get(username) as { id: number; role: string } | undefined;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isAdmin = user.role !== "Member" && user.role !== "Partner";
    const senderRole = isAdmin ? "admin" : "user";

    const result = db.prepare(`
      INSERT INTO chat_messages (sessionId, senderId, senderRole, content, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(Number(sessionId), user.id, senderRole, content, type);

    const msg = db.prepare(`
      SELECT m.id, m.senderId, m.senderRole, m.content, m.type, m.createdAt, u.username as senderName
      FROM chat_messages m LEFT JOIN users u ON m.senderId = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
