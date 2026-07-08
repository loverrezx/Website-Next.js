import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/?discord_error=1`);
  }

  const db = getDb();
  const s = db.prepare("SELECT discordClientId, discordClientSecret FROM site_settings WHERE id = 1").get() as any;
  const clientId = s?.discordClientId ?? "";
  const clientSecret = s?.discordClientSecret ?? "";

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/?discord_error=1`);
  }

  const redirectUri = `${origin}/api/auth/discord/callback`;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });

  if (!tokenRes.ok) return NextResponse.redirect(`${origin}/?discord_error=1`);
  const { access_token } = await tokenRes.json();

  const userRes = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${access_token}` } });
  if (!userRes.ok) return NextResponse.redirect(`${origin}/?discord_error=1`);

  const discordUser = await userRes.json();
  const username = discordUser.username;
  const email = discordUser.email ?? `${discordUser.id}@discord.local`;
  const avatar = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : "";

  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user) {
    db.prepare("INSERT INTO users (username, email, password, role, profileImage) VALUES (?, ?, '', 'Member', ?)").run(username, email, avatar);
    user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  }

  const { password: _pw, ...safeUser } = user;
  return NextResponse.redirect(`${origin}/?discord_session=${encodeURIComponent(JSON.stringify(safeUser))}`);
}
