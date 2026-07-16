import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

    const service = createServiceClient();

    const { data: affiliate } = await service
      .from("affiliates")
      .select("referral_code")
      .eq("user_id", user.id)
      .single();

    const { data: assets } = await service
      .from("marketing_assets")
      .select("*")
      .eq("is_active", true)
      .order("type");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://velanthor.org";
    const referralLink = affiliate ? `${appUrl}/?ref=${affiliate.referral_code}` : appUrl;

    const personalized = (assets ?? []).map((asset) => ({
      ...asset,
      content: asset.content
        ? asset.content.replaceAll("{{referral_link}}", referralLink).replaceAll("{{name}}", "")
        : null,
    }));

    return NextResponse.json({ assets: personalized });
  } catch (err) {
    console.error("Marketing assets error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
