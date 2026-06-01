import type { SupabaseClient } from "@supabase/supabase-js";
import { DAILY_MESSAGE_LIMIT } from "@/lib/constants";
import type { Database } from "@/lib/supabase/database.types";

type AppSupabase = SupabaseClient<Database>;

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}

/**
 * Checks and increments the user's daily message count.
 * Returns allowed=false when the limit is reached.
 */
export async function checkAndIncrementDailyUsage(
  supabase: AppSupabase,
  userId: string,
): Promise<RateLimitResult> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("usage_daily")
    .select("message_count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  const currentCount = existing?.message_count ?? 0;

  if (currentCount >= DAILY_MESSAGE_LIMIT) {
    return { allowed: false, count: currentCount, limit: DAILY_MESSAGE_LIMIT };
  }

  const newCount = currentCount + 1;

  if (existing) {
    await supabase
      .from("usage_daily")
      .update({ message_count: newCount })
      .eq("user_id", userId)
      .eq("date", today);
  } else {
    await supabase.from("usage_daily").insert({
      user_id: userId,
      date: today,
      message_count: newCount,
    });
  }

  return { allowed: true, count: newCount, limit: DAILY_MESSAGE_LIMIT };
}
