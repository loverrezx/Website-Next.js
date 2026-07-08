import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, password, email, mode, amount } = body;

  const user = db.prepare("SELECT id, balance FROM users WHERE id = ?").get(id) as any;
  if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

  if (action === "password") {
    if (!password?.trim()) return NextResponse.json({ error: "กรุณากรอกรหัสผ่านใหม่" }, { status: 400 });
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(password, id);
    return NextResponse.json({ success: true });
  }

  if (action === "email") {
    if (!email?.trim()) return NextResponse.json({ error: "กรุณากรอกอีเมลใหม่" }, { status: 400 });
    const conflict = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, id);
    if (conflict) return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
    db.prepare("UPDATE users SET email = ? WHERE id = ?").run(email, id);
    return NextResponse.json({ success: true });
  }

  if (action === "balance") {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return NextResponse.json({ error: "จำนวนเงินไม่ถูกต้อง" }, { status: 400 });
    if (mode === "subtract" && amt > user.balance) {
      return NextResponse.json({ error: "ยอดเงินที่จะลบมากกว่าที่ผู้ใช้มีอยู่" }, { status: 400 });
    }
    const delta = mode === "add" ? amt : -amt;
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(delta, id);
    const updated = db.prepare("SELECT balance FROM users WHERE id = ?").get(id) as any;
    return NextResponse.json({ success: true, balance: updated.balance });
  }

  return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 400 });
}

export async function DELETE(_req: Request, { params }: Params) {
  const db = getDb();
  const { id } = await params;
  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
  if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

  db.transaction(() => {
    db.prepare("DELETE FROM topup_code_uses WHERE userId = ?").run(id);
    db.prepare("DELETE FROM topup_history WHERE userId = ?").run(id);
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
  })();

  return NextResponse.json({ success: true });
}