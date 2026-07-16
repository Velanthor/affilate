/**
 * VELANTHOR — Ersten Admin-Account einrichten
 *
 * Registriere dich zunächst ganz normal über /register als Affiliate.
 * Führe danach dieses Skript aus, um dein Konto zum Admin zu befördern:
 *
 *   npx tsx scripts/create-admin.ts deine@email.de
 *
 * Benötigt SUPABASE_SERVICE_ROLE_KEY und NEXT_PUBLIC_SUPABASE_URL aus .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const email = process.argv[2];

if (!email) {
  console.error("Verwendung: npx tsx scripts/create-admin.ts <email>");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Fehler: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, first_name, last_name, role")
    .eq("email", email)
    .single();

  if (userError || !user) {
    console.error(`Kein Nutzer mit der E-Mail "${email}" gefunden. Bitte zuerst über /register registrieren.`);
    process.exit(1);
  }

  if (user.role === "admin" || user.role === "super_admin") {
    console.log(`${email} ist bereits Admin (Rolle: ${user.role}).`);
    process.exit(0);
  }

  const { error: updateError } = await supabase.from("users").update({ role: "super_admin" }).eq("id", user.id);

  if (updateError) {
    console.error("Fehler beim Aktualisieren der Rolle:", updateError.message);
    process.exit(1);
  }

  // Also mark the affiliate profile active + verified, in case it was still pending
  await supabase.from("users").update({ email_verified: true }).eq("id", user.id);
  await supabase.from("affiliates").update({ status: "active" }).eq("user_id", user.id);

  console.log(`✅ ${user.first_name} ${user.last_name} (${email}) ist jetzt Super-Admin.`);
  console.log("   Login unter /login, danach ist /admin erreichbar.");
}

main();
