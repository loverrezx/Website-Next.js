import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function normalize(row: any) {
  return {
    ...row,
    isOnline: row.isOnline === 1,
    promptpayFeeEnabled: row.promptpayFeeEnabled === 1,
    promptpayEnabled: row.promptpayEnabled === 1,
    discordLoginEnabled: row.discordLoginEnabled === 1,
    bankFeeEnabled: row.bankFeeEnabled === 1,
    bankEnabled: row.bankEnabled === 1,
  };
}

export async function GET() {
  const db = getDb();
  const row = db.prepare("SELECT * FROM site_settings WHERE id = 1").get() as any;
  return NextResponse.json(normalize(row));
}

export async function PUT(req: Request) {
  const db = getDb();
  const b = await req.json();

  db.prepare(`
    UPDATE site_settings SET
      siteName = ?,
      siteLogo = ?,
      textColor = ?,
      isOnline = ?,
      accessCode = ?,
      promptpayPhone = ?,
      promptpayFeeType = ?,
      promptpayFeeValue = ?,
      promptpayFeeEnabled = ?,
      promptpayEnabled = ?,
      discordClientId = ?,
      discordClientSecret = ?,
      discordLoginEnabled = ?,
      bankRecipientName = ?,
      bankType = ?,
      bankAccountNumber = ?,
      bankFeeType = ?,
      bankFeeValue = ?,
      bankFeeEnabled = ?,
      bankEnabled = ?,
      ghostxApiKey = ?,
      primaryColor = ?,
      buttonColor = ?
    WHERE id = 1
  `).run(
    b.siteName ?? "NextStore",
    b.siteLogo ?? "",
    b.textColor ?? "",
    b.isOnline ? 1 : 0,
    b.accessCode ?? "",
    b.promptpayPhone ?? "",
    b.promptpayFeeType ?? "percent",
    b.promptpayFeeValue ?? 0,
    b.promptpayFeeEnabled ? 1 : 0,
    b.promptpayEnabled ? 1 : 0,
    b.discordClientId ?? "",
    b.discordClientSecret ?? "",
    b.discordLoginEnabled ? 1 : 0,
    b.bankRecipientName ?? "",
    b.bankType ?? "",
    b.bankAccountNumber ?? "",
    b.bankFeeType ?? "percent",
    b.bankFeeValue ?? 0,
    b.bankFeeEnabled ? 1 : 0,
    b.bankEnabled ? 1 : 0,
    b.ghostxApiKey ?? "",
    b.primaryColor ?? "",
    b.buttonColor ?? "",
  );

  const row = db.prepare("SELECT * FROM site_settings WHERE id = 1").get() as any;
  return NextResponse.json(normalize(row));
}
