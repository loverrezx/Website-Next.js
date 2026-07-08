import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { code, amount, maxUses, expiresAt, maxUsesPerUser, status } = body;

  const existing = db.prepare("SELECT id FROM topup_codes WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "ไม่พบโค้ด" }, { status: 404 });

  const conflict = db.prepare("SELECT id FROM topup_codes WHERE code = ? AND id != ?").get(code?.trim(), id);
  if (conflict) return NextResponse.json({ error: "โค้ดนี้มีอยู่แล้ว" }, { status: 409 });

  db.prepare(`
    UPDATE topup_codes SET
      code = COALESCE(?, code),
      amount = COALESCE(?, amount),
      maxUses = COALESCE(?, maxUses),
      expiresAt = ?,
      maxUsesPerUser = COALESCE(?, maxUsesPerUser),
      status = ?
    WHERE id = ?
  `).run(
    code?.trim() ?? null,
    amount ?? null,
    maxUses ?? null,
    expiresAt ?? null,
    maxUsesPerUser ?? null,
    status ? 1 : 0,
    id
  );

  const updated = db.prepare("SELECT * FROM topup_codes WHERE id = ?").get(id);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const db = getDb();
  const { id } = await params;
  const existing = db.prepare("SELECT id FROM topup_codes WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "ไม่พบโค้ด" }, { status: 404 });

  db.transaction(() => {
    db.prepare("DELETE FROM topup_code_uses WHERE codeId = ?").run(id);
    db.prepare("DELETE FROM topup_codes WHERE id = ?").run(id);
  })();

  return NextResponse.json({ success: true });
}