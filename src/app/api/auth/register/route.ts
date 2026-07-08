import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDb();
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const existing = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email) as any;
  if (existing) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
  }

  db.prepare("INSERT INTO users (username, email, password, role, profileImage) VALUES (?, ?, ?, 'Member', '')").run(username, email, password);
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  const { password: _pw, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}
