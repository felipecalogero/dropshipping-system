import { createHmac } from "crypto";
import { cookies } from "next/headers";

export { hashPassword, verifyPassword } from "./passwords";

const COOKIE = "admin_session";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-change-me";
}

export function signSession(email: string): string {
  const sig = createHmac("sha256", secret()).update(email).digest("hex");
  return `${email}.${sig}`;
}

export function readSession(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  const email = value.slice(0, dot);
  return signSession(email) === value ? email : null;
}

export async function currentAdmin(): Promise<string | null> {
  const jar = await cookies();
  return readSession(jar.get(COOKIE)?.value);
}

export async function setAdminCookie(email: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, signSession(email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
