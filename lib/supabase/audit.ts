import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type AppSupabase = SupabaseClient<Database>;

/**
 * Hashes a client IP for audit logs (no plain IP stored).
 */
export function hashIp(ip: string): string {
  const salt = process.env.AUDIT_IP_SALT ?? "ai-legal-chat";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Extracts client IP from request headers (best-effort).
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return request.headers.get("x-real-ip");
}

/**
 * Inserts an audit event for the authenticated user.
 */
export async function logAuditEvent(
  supabase: AppSupabase,
  params: {
    userId: string;
    action: string;
    metadata?: Record<string, unknown>;
    request?: Request;
  },
): Promise<void> {
  const ip = params.request ? getClientIp(params.request) : null;

  await supabase.from("audit_events").insert({
    user_id: params.userId,
    action: params.action,
    metadata: (params.metadata ?? {}) as Database["public"]["Tables"]["audit_events"]["Insert"]["metadata"],
    ip_hash: ip ? hashIp(ip) : null,
  });
}
