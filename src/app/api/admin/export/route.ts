import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { requireAdmin } from "@/lib/admin-guard";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "csv";
  const type = searchParams.get("type") ?? "affiliates";

  let rows: Record<string, any>[] = [];
  let filename = "velanthor-export";

  if (type === "affiliates") {
    const { data } = await service
      .from("affiliates")
      .select("referral_code, status, tier_level, country, total_clicks, total_conversions, total_revenue_generated, total_commission_earned, total_commission_paid, created_at, users(first_name, last_name, email)");

    rows = (data ?? []).map((a: any) => ({
      Name: a.users ? `${a.users.first_name} ${a.users.last_name}` : "",
      "E-Mail": a.users?.email ?? "",
      "Referral-Code": a.referral_code,
      Status: a.status,
      Ebene: a.tier_level,
      Land: a.country ?? "",
      Klicks: a.total_clicks,
      Conversions: a.total_conversions,
      "Umsatz (€)": Number(a.total_revenue_generated).toFixed(2),
      "Provision verdient (€)": Number(a.total_commission_earned).toFixed(2),
      "Provision ausgezahlt (€)": Number(a.total_commission_paid).toFixed(2),
      Registriert: formatDate(a.created_at),
    }));
    filename = "velanthor-affiliates";
  } else if (type === "payouts") {
    const { data } = await service
      .from("payouts")
      .select("amount, method, destination, status, requested_at, paid_at, affiliates(referral_code, users(first_name, last_name, email))");

    rows = (data ?? []).map((p: any) => ({
      Affiliate: p.affiliates?.users ? `${p.affiliates.users.first_name} ${p.affiliates.users.last_name}` : "",
      "E-Mail": p.affiliates?.users?.email ?? "",
      "Referral-Code": p.affiliates?.referral_code ?? "",
      "Betrag (€)": Number(p.amount).toFixed(2),
      Methode: p.method,
      Ziel: p.destination,
      Status: p.status,
      Beantragt: formatDate(p.requested_at),
      Bezahlt: p.paid_at ? formatDate(p.paid_at) : "",
    }));
    filename = "velanthor-payouts";
  }

  if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  const csv = Papa.unparse(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
