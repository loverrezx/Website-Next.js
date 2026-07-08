import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const channels = db.prepare(`
      SELECT id, platform, name, url FROM contact_channels
      WHERE enabled = 1 ORDER BY sortOrder ASC, createdAt ASC
    `).all();
    return NextResponse.json({ channels });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
