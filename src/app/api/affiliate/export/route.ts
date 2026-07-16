import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") ?? "csv";

    const service = createServiceClient();
    const { data: affiliate } = await service
      .from("affiliates")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: "Kein Affiliate-Profil gefunden" }, { status: 404 });
    }

    const { data: commissions } = await service
      .from("commissions")
      .select("created_at, tier_level, type, rate, base_amount, commission_amount, status")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    const rows = (commissions ?? []).map((c) => ({
      Datum: formatDate(c.created_at),
      Ebene: c.tier_level,
      Typ: c.type,
      Satz: c.rate ? `${c.rate}%` : "-",
      Basisbetrag: Number(c.base_amount).toFixed(2),
      Provision: Number(c.commission_amount).toFixed(2),
      Status: c.status,
    }));

    if (format === "xlsx") {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Statistiken");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="velanthor-statistiken.xlsx"`,
        },
      });
    }

    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="velanthor-statistiken.csv"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Export fehlgeschlagen" }, { status: 500 });
  }
}
