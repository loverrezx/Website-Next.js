import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDb();
  const s = db.prepare("SELECT promptpayEnabled, promptpayFeeType, promptpayFeeValue, promptpayFeeEnabled FROM site_settings WHERE id = 1").get() as any;

  if (!s?.promptpayEnabled) {
    return NextResponse.json({ error: "ช่องทางการเติมเงินนี้ถูกปิดการใช้งานชั่วคราว" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { angpaoLink, username } = body ?? {};

  if (!angpaoLink?.trim()) {
    return NextResponse.json({ error: "กรุณากรอกลิงก์ซองอั่งเปา" }, { status: 400 });
  }
  if (!angpaoLink.includes("truemoney.com")) {
    return NextResponse.json({ error: "ใช้ได้เฉพาะลิงก์จาก TrueMoney Wallet เท่านั้น" }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  // Normalize reference key: strip query params to canonical form
  const ref = angpaoLink.trim().toLowerCase().split("?")[0];
  const fullRef = angpaoLink.trim();

  // Check for duplicate
  const used = db.prepare("SELECT id FROM topup_used_refs WHERE reference = ?").get(fullRef);
  if (used) {
    return NextResponse.json({ error: "ลิงก์ซองอั่งเปานี้ถูกใช้ไปแล้ว" }, { status: 409 });
  }

  const user = db.prepare("SELECT id, balance FROM users WHERE username = ?").get(username) as any;
  if (!user) {
    return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  // Extract amount from link (mock — real integration requires TrueMoney API)
  let rawAmount = Math.floor(20 + Math.random() * 480);
  const numMatch = angpaoLink.match(/[\?&]v=(\d+)/) ?? angpaoLink.match(/\/(\d+)(?:\/|$)/);
  if (numMatch) rawAmount = parseFloat(numMatch[1]);

  const fee = s.promptpayFeeEnabled
    ? s.promptpayFeeType === "percent" ? rawAmount * s.promptpayFeeValue / 100 : s.promptpayFeeValue
    : 0;
  const finalAmount = Math.max(0, parseFloat((rawAmount - fee).toFixed(2)));

  // Persist in a transaction
  db.transaction(() => {
    db.prepare("INSERT INTO topup_used_refs (reference) VALUES (?)").run(fullRef);
    db.prepare("INSERT INTO topup_history (userId, type, reference, rawAmount, fee, finalAmount) VALUES (?,?,?,?,?,?)")
      .run(user.id, "angpao", fullRef, rawAmount, fee, finalAmount);
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(finalAmount, user.id);
  })();

  const updatedBalance = (db.prepare("SELECT balance FROM users WHERE id = ?").get(user.id) as any).balance;

  return NextResponse.json({ success: true, rawAmount, fee, finalAmount, balance: updatedBalance });
}
