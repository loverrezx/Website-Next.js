import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET — list all users
export async function GET() {
  const db = getDb();
  const users = db.prepare(
    "SELECT id, username, email, role, profileImage, balance FROM users ORDER BY id ASC"
  ).all();
  return NextResponse.json(users);
}
