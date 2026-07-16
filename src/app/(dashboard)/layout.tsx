import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("referral_code, status, tier_level")
    .eq("user_id", user.id)
    .single();

  if (!profile || !affiliate) redirect("/login");

  return (
    <div className="min-h-screen grid-bg">
      <Sidebar />
      <div className="lg:pl-64">
        <DashboardHeader
          firstName={profile.first_name}
          lastName={profile.last_name}
          email={profile.email}
          avatarUrl={profile.avatar_url}
          affiliateStatus={affiliate.status}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
