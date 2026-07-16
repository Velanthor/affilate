import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { mailer } from "@/services/mailer";
import { formatCurrency } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = service
    .from("payouts")
    .select("*, affiliates(referral_code, users(first_name, last_name, email))")
    .order("requested_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });

  const payouts = (data ?? []).map((p: any) => ({
    id: p.id,
    amount: Number(p.amount),
    method: p.method,
    destination: p.destination,
    status: p.status,
    requestedAt: p.requested_at,
    paidAt: p.paid_at,
    rejectionReason: p.rejection_reason,
    affiliateId: p.affiliate_id,
    affiliateName: p.affiliates?.users ? `${p.affiliates.users.first_name} ${p.affiliates.users.last_name}` : "—",
    affiliateEmail: p.affiliates?.users?.email ?? "—",
    referralCode: p.affiliates?.referral_code ?? "",
  }));

  return NextResponse.json({ payouts });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service, user } = admin;
  const body = await req.json();
  const { payoutId, action, rejectionReason, transactionReference } = body;

  if (!payoutId || !["approve", "reject", "mark_paid"].includes(action)) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { data: payout } = await service
    .from("payouts")
    .select("*, affiliates(user_id, users(email, first_name))")
    .eq("id", payoutId)
    .single();

  if (!payout) return NextResponse.json({ error: "Auszahlung nicht gefunden" }, { status: 404 });

  const updates: Record<string, any> = { reviewed_by: user.id, reviewed_at: new Date().toISOString() };

  if (action === "approve") {
    updates.status = "approved";
  } else if (action === "reject") {
    updates.status = "rejected";
    updates.rejection_reason = rejectionReason || "Keine Angabe";
    // Release reserved commissions back to "approved" so the affiliate can request again
    if (payout.commission_ids?.length) {
      await service.from("commissions").update({ status: "approved" }).in("id", payout.commission_ids);
    }
  } else if (action === "mark_paid") {
    updates.status = "paid";
    updates.paid_at = new Date().toISOString();
    updates.transaction_reference = transactionReference || null;
    if (payout.commission_ids?.length) {
      await service.from("commissions").update({ status: "paid", paid_at: new Date().toISOString() }).in("id", payout.commission_ids);
    }
  }

  const { error } = await service.from("payouts").update(updates).eq("id", payoutId);
  if (error) return NextResponse.json({ error: "Aktualisierung fehlgeschlagen" }, { status: 500 });

  const affiliateUser = payout.affiliates?.users as any;
  if (affiliateUser) {
    if (action === "approve") {
      await mailer.sendPayoutApprovedEmail(affiliateUser.email, affiliateUser.first_name, formatCurrency(Number(payout.amount)));
    }
  }

  await service.from("logs").insert({
    actor_id: user.id,
    action: `payout_${action}`,
    entity_type: "payout",
    entity_id: payoutId,
    metadata: { amount: payout.amount },
  });

  return NextResponse.json({ success: true, message: "Auszahlung aktualisiert." });
}
