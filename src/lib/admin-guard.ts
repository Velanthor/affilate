import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Verifies the current request is made by an authenticated admin/super_admin.
 * Returns the user + service client on success, or null if unauthorized.
 * Use at the top of every /api/admin/* route handler.
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const service = createServiceClient();
  const { data: profile } = await service.from("users").select("role").eq("id", user.id).single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    return null;
  }

  return { user, service, role: profile.role as "admin" | "super_admin" };
}
