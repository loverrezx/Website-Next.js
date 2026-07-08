import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const db = getDb();
  const s = db.prepare("SELECT discordClientId, discordLoginEnabled FROM site_settings WHERE id = 1").get() as any;
  const base = new URL(req.url).origin;

  if (!s?.discordLoginEnabled) {
    return NextResponse.redirect(`${base}/?discord_error=disabled`);
  }
  if (!s.discordClientId) {
    return NextResponse.json({ error: "Discord OAuth ยังไม่ได้ตั้งค่า Client ID" }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: s.discordClientId,
    redirect_uri: `${base}/api/auth/discord/callback`,
    response_type: "code",
    scope: "identify email",
  });

  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`);
}
