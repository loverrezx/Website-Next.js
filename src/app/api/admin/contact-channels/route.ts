import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const channels = db.prepare(`
      SELECT id, platform, name, url, sortOrder, enabled, createdAt
      FROM contact_channels ORDER BY sortOrder ASC, createdAt ASC
    `).all();
    return NextResponse.json({ channels });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { platform, name, url } = await req.json();
    if (!platform || !name || !url) {
      return NextResponse.json({ error: "platform, name and url are required" }, { status: 400 });
    }
    const db = getDb();
    const maxSort = db.prepare(`SELECT COALESCE(MAX(sortOrder), -1) as max FROM contact_channels`).get() as { max: number };
    const result = db.prepare(`
      INSERT INTO contact_channels (platform, name, url, sortOrder) VALUES (?, ?, ?, ?)
    `).run(platform, name, url, maxSort.max + 1);
    const row = db.prepare(`SELECT * FROM contact_channels WHERE id = ?`).get(result.lastInsertRowid);
    return NextResponse.json({ channel: row }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, platform, name, url, enabled } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = getDb();
    db.prepare(`
      UPDATE contact_channels SET platform = ?, name = ?, url = ?, enabled = ? WHERE id = ?
    `).run(platform, name, url, enabled ? 1 : 0, id);
    const row = db.prepare(`SELECT * FROM contact_channels WHERE id = ?`).get(id);
    return NextResponse.json({ channel: row });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = getDb();
    const result = db.prepare(`DELETE FROM contact_channels WHERE id = ?`).run(id);
    if (result.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
