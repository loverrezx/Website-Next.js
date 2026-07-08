import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const db = getDb();
  const { username } = await params;
  const user = db.prepare("SELECT id, username, email, role, profileImage, balance FROM users WHERE username = ?").get(username) as any;
  if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const db = getDb();
  const { username } = await params;
  const body = await req.json();
  const { newUsername, email, password, profileImage } = body;

  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as any;
  if (!existing) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

  if (newUsername && newUsername !== username) {
    const conflict = db.prepare("SELECT id FROM users WHERE username = ? AND username != ?").get(newUsername, username) as any;
    if (conflict) return NextResponse.json({ error: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" }, { status: 409 });
  }
  if (email) {
    const conflict = db.prepare("SELECT id FROM users WHERE email = ? AND username != ?").get(email, username) as any;
    if (conflict) return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
  }

  db.prepare(`
    UPDATE users SET
      username = COALESCE(?, username),
      email = COALESCE(?, email),
      password = COALESCE(?, password),
      profileImage = COALESCE(?, profileImage)
    WHERE username = ?
  `).run(newUsername ?? null, email ?? null, password ?? null, profileImage ?? null, username);

  const updated = db.prepare("SELECT id, username, email, role, profileImage FROM users WHERE username = ?").get(newUsername ?? username) as any;
  return NextResponse.json(updated);
}
