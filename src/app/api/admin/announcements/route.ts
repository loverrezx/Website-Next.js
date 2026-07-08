import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET: Fetch all announcements
export async function GET() {
  try {
    const db = getDb();
    const announcements = db.prepare(`
      SELECT id, text, sortOrder, createdAt
      FROM announcements
      ORDER BY sortOrder ASC, createdAt ASC
    `).all();
    return NextResponse.json({ announcements });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Add new announcement
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const db = getDb();
    // Get max sortOrder
    const maxSort = db.prepare(`SELECT COALESCE(MAX(sortOrder), -1) as max FROM announcements`).get() as { max: number };
    const newSortOrder = maxSort.max + 1;

    const result = db.prepare(`
      INSERT INTO announcements (text, sortOrder)
      VALUES (?, ?)
    `).run(text.trim(), newSortOrder);

    const newAnnouncement = db.prepare(`
      SELECT id, text, sortOrder, createdAt
      FROM announcements
      WHERE id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ announcement: newAnnouncement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update announcement text
export async function PUT(req: NextRequest) {
  try {
    const { id, text } = await req.json();
    if (!id || typeof id !== "number" || !text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "id and text are required" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(`
      UPDATE announcements
      SET text = ?
      WHERE id = ?
    `).run(text.trim(), id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    const updated = db.prepare(`
      SELECT id, text, sortOrder, createdAt
      FROM announcements
      WHERE id = ?
    `).get(id);

    return NextResponse.json({ announcement: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove announcement
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "number") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(`DELETE FROM announcements WHERE id = ?`).run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
