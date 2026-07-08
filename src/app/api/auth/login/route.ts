import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDb();
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const user = db.prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?").get(username, username, password) as any;
  if (!user) {
    return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const { password: _pw, ...safeUser } = user;
  return NextResponse.json(safeUser);
}
