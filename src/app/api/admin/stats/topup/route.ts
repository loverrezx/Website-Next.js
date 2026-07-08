import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    // Per-user totals
    const byUser = db.prepare(`
      SELECT u.username, SUM(h.finalAmount) as total, COUNT(*) as count
      FROM topup_history h
      JOIN users u ON h.userId = u.id
      WHERE h.status = 'success'
      GROUP BY h.userId
      ORDER BY total DESC
    `).all() as { username: string; total: number; count: number }[];

    // Daily totals (last 30 days)
    const daily = db.prepare(`
      SELECT date(createdAt) as day, SUM(finalAmount) as total, COUNT(*) as count
      FROM topup_history
      WHERE status = 'success' AND createdAt >= date('now', '-29 days', 'localtime')
      GROUP BY day
      ORDER BY day ASC
    `).all() as { day: string; total: number; count: number }[];

    // Overall total
    const overall = db.prepare(`
      SELECT SUM(finalAmount) as total, COUNT(*) as count
      FROM topup_history
      WHERE status = 'success'
    `).get() as { total: number; count: number };

    return NextResponse.json({ byUser, daily, overall: overall ?? { total: 0, count: 0 } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
