import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen grid-bg">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader firstName={profile.first_name} lastName={profile.last_name} email={profile.email} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
