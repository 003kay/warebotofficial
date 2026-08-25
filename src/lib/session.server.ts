import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "ware_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const COOKIE_DOMAIN = ".warebot.xyz";

function getSecret(): string {
  const s = process.env.SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET;
  if (!s) throw new Error("SESSION_SECRET or DISCORD_CLIENT_SECRET is not set");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function domainPart() {
  return process.env.NODE_ENV === "production" ? `; Domain=${COOKIE_DOMAIN}` : "";
}

export function createSessionCookie(discordUserId: string): string {
  const payload = `${discordUserId}.${Date.now()}`;
  const sig = sign(payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}${domainPart()}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0${domainPart()}`;
}

export function readSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.slice(COOKIE_NAME.length + 1);
  const lastDot = value.lastIndexOf(".");
  if (lastDot < 0) return null;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [discordUserId] = payload.split(".");
  return discordUserId || null;
}

export function createStateCookie(state: string): string {
  return `ware_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600${domainPart()}`;
}

export function readStateFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith("ware_oauth_state="));
  return match ? match.slice("ware_oauth_state=".length) : null;
}
