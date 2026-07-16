import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { createServiceClient } from "@/lib/supabase/server";
import { hashIp } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ref, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, referrer, landingPage } = body;

    if (!ref || typeof ref !== "string") {
      return NextResponse.json({ error: "Kein Referral-Code angegeben" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, status")
      .eq("referral_code", ref)
      .single();

    if (!affiliate || affiliate.status !== "active") {
      // Silently no-op for unknown/inactive codes — never leak which codes exist
      return NextResponse.json({ success: true });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = req.headers.get("user-agent") ?? "";
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    const country = req.headers.get("x-vercel-ip-country") ?? null;

    let campaignId: string | null = null;
    if (utmCampaign) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id")
        .eq("slug", utmCampaign)
        .single();
      campaignId = campaign?.id ?? null;
    }

    const sessionId = crypto.randomUUID();

    const { data: click, error: clickError } = await supabase
      .from("clicks")
      .insert({
        affiliate_id: affiliate.id,
        campaign_id: campaignId,
        ip_hash: hashIp(ip),
        country_code: country,
        device_type: (device.type as any) === "mobile" ? "mobile" : device.type === "tablet" ? "tablet" : "desktop",
        browser: browser.name ?? "unknown",
        os: os.name ?? "unknown",
        referrer: referrer ?? null,
        landing_page: landingPage ?? null,
        utm_source: utmSource ?? null,
        utm_medium: utmMedium ?? null,
        utm_campaign: utmCampaign ?? null,
        utm_content: utmContent ?? null,
        utm_term: utmTerm ?? null,
        session_id: sessionId,
      })
      .select("id")
      .single();

    if (clickError) {
      console.error("Click insert failed:", clickError);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    await supabase
      .from("sessions")
      .insert({
        affiliate_id: affiliate.id,
        click_id: click.id,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      });

    await supabase.rpc("increment_affiliate_clicks", { p_affiliate_id: affiliate.id });

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    console.error("Click tracking error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
