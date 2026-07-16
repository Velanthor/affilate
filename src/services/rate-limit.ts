import { createServiceClient } from "@/lib/supabase/server";

/**
 * Sliding-window rate limiter backed by Supabase Postgres.
 * Works on serverless (Vercel) without needing Redis or a paid add-on.
 *
 * @param key unique bucket key, e.g. `register:1.2.3.4` or `login:user@mail.com`
 * @param maxAttempts allowed attempts within the window
 * @param windowSeconds window length in seconds
 * @returns true if the action is allowed, false if the limit was exceeded
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error("Rate limit check failed, failing open:", error);
      return true; // fail open rather than locking everyone out on a DB hiccup
    }

    return Boolean(data);
  } catch (err) {
    console.error("Rate limit exception, failing open:", err);
    return true;
  }
}
