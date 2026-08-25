import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "ware_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type WareSessionData = {
  discordUserId: string;
  username: string;
  avatar: string | null;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

function getSecret(): string {
  const s = process.env.SESSION_SECRET || process.env.DISCORD_CLIENT_SECRET;
  if (!s) throw new Error("SESSION_SECRET or DISCORD_CLIENT_SECRET is not set");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodePayload(data: WareSessionData): string {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
}

function decodePayload(value: string): WareSessionData | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as WareSessionData;
    if (!parsed?.discordUserId || !parsed?.accessToken || !parsed?.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createSessionCookie(data: WareSessionData): string {
  const payload = encodePayload(data);
  const sig = sign(payload);
  const value = `${payload}.${sig}`;
  // OAuth is canonicalized to www.warebot.xyz, so keep the cookie host-only.
  // This avoids browser/domain edge cases that can cause an authorize loop.
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSessionDataFromCookie(cookieHeader: string | null): WareSessionData | null {
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
  const data = decodePayload(payload);
  if (!data) return null;
  if (data.expiresAt <= Date.now()) return null;
  return data;
}

export function readSessionFromCookie(cookieHeader: string | null): string | null {
  return readSessionDataFromCookie(cookieHeader)?.discordUserId ?? null;
}

export function createStateCookie(state: string): string {
  return `ware_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
}

export function clearStateCookie(): string {
  return `ware_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readStateFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith("ware_oauth_state="));
  return match ? match.slice("ware_oauth_state=".length) : null;
}
