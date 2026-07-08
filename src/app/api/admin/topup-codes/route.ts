import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const codes = db.prepare("SELECT * FROM topup_codes ORDER BY id DESC").all();
  return NextResponse.json(codes);
}

export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json().catch(() => ({}));
  const { code, amount, maxUses, expiresAt, maxUsesPerUser, status } = body;

  if (!code?.trim()) return NextResponse.json({ error: "กรุณากรอกโค้ด" }, { status: 400 });
  if (!amount || amount <= 0) return NextResponse.json({ error: "กรุณาระบุจำนวนเงิน" }, { status: 400 });

  const conflict = db.prepare("SELECT id FROM topup_codes WHERE code = ?").get(code.trim());
  if (conflict) return NextResponse.json({ error: "โค้ดนี้มีอยู่แล้ว" }, { status: 409 });

  const result = db.prepare(
    "INSERT INTO topup_codes (code, amount, maxUses, expiresAt, maxUsesPerUser, status) VALUES (?,?,?,?,?,?)"
  ).run(code.trim(), amount, maxUses ?? 1, expiresAt ?? null, maxUsesPerUser ?? 1, status ? 1 : 0);

  const created = db.prepare("SELECT * FROM topup_codes WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(created, { status: 201 });
}