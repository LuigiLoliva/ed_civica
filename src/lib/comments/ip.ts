import { createHash } from "crypto";
import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") ?? "unknown";
}

export function hashIp(ip: string): string {
  const salt = process.env.COMMENT_IP_HASH_SALT ?? "voci-unite-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
