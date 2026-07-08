import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDb();
  const s = db.prepare("SELECT bankEnabled, bankFeeType, bankFeeValue, bankFeeEnabled, bankAccountNumber FROM site_settings WHERE id = 1").get() as any;

  if (!s?.bankEnabled) {
    return NextResponse.json({ error: "ช่องทางการเติมเงินนี้ถูกปิดการใช้งานชั่วคราว" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { qrData, username } = body ?? {};

  if (!qrData?.trim()) {
    return NextResponse.json({ error: "ไม่พบข้อมูล QR Code กรุณาลองใหม่" }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  // Call GhostX to verify QR
  const ghostRes = await fetch("https://externalauth.ghostxapi.xyz/qr/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrData }),
  }).catch(() => null);

  if (!ghostRes || !ghostRes.ok) {
    return NextResponse.json({ error: "ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง" }, { status: 502 });
  }

  const result = await ghostRes.json();
  const transfer = result?.slipVerification?.transfer;

  if (!transfer) {
    return NextResponse.json({ error: "สลิปไม่ถูกต้องหรือไม่สามารถอ่านข้อมูลได้" }, { status: 422 });
  }

  const transactionRef = transfer.transactionRef as string;
  const rawAmount = parseFloat(transfer.amount?.amount ?? 0);

  if (!rawAmount || rawAmount <= 0) {
    return NextResponse.json({ error: "ไม่พบยอดเงินในสลิป" }, { status: 422 });
  }

  // Validate destination account matches configured bank account
  // Support both exact match and suffix match for masked accounts (e.g. "xxx-x-x6427" → "6427")
  if (s.bankAccountNumber && transfer.toAccountNo) {
    const digitsOnly = (v: string) => v.replace(/\D/g, "");
    const cfgDigits = digitsOnly(s.bankAccountNumber);
    const slipDigits = digitsOnly(transfer.toAccountNo);
    if (cfgDigits && slipDigits) {
      const exactMatch = cfgDigits === slipDigits;
      const partialMatch = slipDigits.length >= 3 && cfgDigits.includes(slipDigits);
      if (!exactMatch && !partialMatch) {
        return NextResponse.json({ error: "เลขบัญชีปลายทางไม่ตรงกับบัญชีที่ลงทะเบียน" }, { status: 422 });
      }
    }
  }

  // Check for duplicate transactionRef
  const used = db.prepare("SELECT id FROM topup_used_refs WHERE reference = ?").get(transactionRef);
  if (used) {
    return NextResponse.json({ error: "สลิปนี้ถูกใช้ไปแล้ว ไม่สามารถใช้ซ้ำได้" }, { status: 409 });
  }

  const user = db.prepare("SELECT id, balance FROM users WHERE username = ?").get(username) as any;
  if (!user) {
    return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  const fee = s.bankFeeEnabled
    ? s.bankFeeType === "percent" ? rawAmount * s.bankFeeValue / 100 : s.bankFeeValue
    : 0;
  const finalAmount = Math.max(0, parseFloat((rawAmount - fee).toFixed(2)));

  db.transaction(() => {
    db.prepare("INSERT INTO topup_used_refs (reference) VALUES (?)").run(transactionRef);
    db.prepare("INSERT INTO topup_history (userId, type, reference, rawAmount, fee, finalAmount) VALUES (?,?,?,?,?,?)")
      .run(user.id, "bank", transactionRef, rawAmount, fee, finalAmount);
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(finalAmount, user.id);
  })();

  const updatedBalance = (db.prepare("SELECT balance FROM users WHERE id = ?").get(user.id) as any).balance;

  return NextResponse.json({
    success: true,
    rawAmount,
    fee,
    finalAmount,
    balance: updatedBalance,
    transfer,
  });
}
