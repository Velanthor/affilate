"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Wallet, ArrowUpRight } from "lucide-react";
import { payoutRequestSchema } from "@/lib/validations";
import { z } from "zod";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PayoutStatusBadge } from "@/components/dashboard/payout-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type FormInput = z.infer<typeof payoutRequestSchema>;

interface Payout {
  id: string;
  amount: number;
  method: string;
  destination: string;
  status: string;
  requested_at: string;
  paid_at: string | null;
  rejection_reason: string | null;
}

const methodLabels: Record<string, string> = { paypal: "PayPal", sepa: "SEPA-Überweisung", crypto: "Krypto-Wallet" };

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [minimumAmount, setMinimumAmount] = useState(25);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(payoutRequestSchema) });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/payouts");
      const data = await res.json();
      if (res.ok) {
        setPayouts(data.payouts);
        setAvailableBalance(data.availableBalance);
        setMinimumAmount(data.minimumAmount);

        const method = data.payoutDetails.preferredMethod ?? "paypal";
        setValue("method", method);
        if (method === "paypal" && data.payoutDetails.paypalEmail) {
          setValue("destination", data.payoutDetails.paypalEmail);
        } else if (method === "sepa" && data.payoutDetails.iban) {
          setValue("destination", data.payoutDetails.iban);
        } else if (method === "crypto" && data.payoutDetails.cryptoWalletAddress) {
          setValue("destination", data.payoutDetails.cryptoWalletAddress);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: FormInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/affiliate/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Auszahlung fehlgeschlagen");
        return;
      }
      toast.success("Auszahlung beantragt!");
      reset();
      loadData();
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Auszahlungen</h1>
        <p className="text-sm text-muted-foreground mt-1">Beantrage Auszahlungen und verfolge deren Status.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-accent-cyan" />
            <span className="text-sm text-muted-foreground">Verfügbares Guthaben</span>
          </div>
          <p className="text-3xl font-bold gradient-text mb-6">{formatCurrency(availableBalance)}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="amount">Betrag (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minimumAmount}
                {...register("amount", { valueAsNumber: true })}
                error={!!errors.amount}
              />
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Mindestbetrag: {formatCurrency(minimumAmount)}</p>
            </div>

            <div>
              <Label htmlFor="method">Auszahlungsmethode</Label>
              <select
                id="method"
                {...register("method")}
                className="flex h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-foreground"
              >
                <option value="paypal">PayPal</option>
                <option value="sepa">SEPA-Überweisung</option>
                <option value="crypto">Krypto-Wallet</option>
              </select>
            </div>

            <div>
              <Label htmlFor="destination">
                {watch("method") === "sepa" ? "IBAN" : watch("method") === "crypto" ? "Wallet-Adresse" : "PayPal E-Mail"}
              </Label>
              <Input id="destination" {...register("destination")} error={!!errors.destination} />
              {errors.destination && <p className="text-xs text-destructive mt-1">{errors.destination.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={submitting} disabled={availableBalance < minimumAmount}>
              <ArrowUpRight className="h-4 w-4" /> Auszahlung beantragen
            </Button>
            {availableBalance < minimumAmount && (
              <p className="text-xs text-muted-foreground text-center">
                Du benötigst mindestens {formatCurrency(minimumAmount)} Guthaben.
              </p>
            )}
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Verlauf</CardTitle>
          </CardHeader>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Noch keine Auszahlungen beantragt.</p>
          ) : (
            <div className="space-y-2">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <div>
                    <div className="font-semibold text-foreground">{formatCurrency(p.amount)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {methodLabels[p.method]} · {formatDateTime(p.requested_at)}
                    </div>
                    {p.status === "rejected" && p.rejection_reason && (
                      <div className="text-xs text-destructive mt-1">{p.rejection_reason}</div>
                    )}
                  </div>
                  <PayoutStatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
