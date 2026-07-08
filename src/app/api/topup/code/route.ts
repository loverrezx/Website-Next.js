import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json().catch(() => ({}));
  const { code, username } = body;

  if (!code?.trim()) return NextResponse.json({ error: "กรุณากรอกโค้ด" }, { status: 400 });
  if (!username) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });

  const user = db.prepare("SELECT id, balance FROM users WHERE username = ?").get(username) as any;
  if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

  const c = db.prepare("SELECT * FROM topup_codes WHERE code = ?").get(code.trim()) as any;
  if (!c) return NextResponse.json({ error: "ไม่พบโค้ดนี้" }, { status: 404 });
  if (!c.status) return NextResponse.json({ error: "โค้ดนี้ถูกปิดการใช้งาน" }, { status: 403 });
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
    return NextResponse.json({ error: "โค้ดนี้หมดอายุแล้ว" }, { status: 410 });
  }
  if (c.maxUses > 0 && c.usedCount >= c.maxUses) {
    return NextResponse.json({ error: "โค้ดนี้ถูกใช้ครบจำนวนแล้ว" }, { status: 409 });
  }

  // Check per-user usage limit
  const userUses = db.prepare(
    "SELECT COUNT(*) as cnt FROM topup_code_uses WHERE codeId = ? AND userId = ?"
  ).get(c.id, user.id) as any;
  if (c.maxUsesPerUser > 0 && userUses.cnt >= c.maxUsesPerUser) {
    return NextResponse.json({ error: "คุณใช้โค้ดนี้ครบจำนวนที่กำหนดแล้ว" }, { status: 409 });
  }

  db.transaction(() => {
    db.prepare("INSERT INTO topup_code_uses (codeId, userId) VALUES (?,?)").run(c.id, user.id);
    db.prepare("UPDATE topup_codes SET usedCount = usedCount + 1 WHERE id = ?").run(c.id);
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(c.amount, user.id);
  })();

  const updatedBalance = (db.prepare("SELECT balance FROM users WHERE id = ?").get(user.id) as any).balance;
  return NextResponse.json({ success: true, amount: c.amount, balance: updatedBalance });
}