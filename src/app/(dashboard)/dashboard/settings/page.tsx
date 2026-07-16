"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { affiliateSettingsSchema } from "@/lib/validations";
import { z } from "zod";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormInput = z.infer<typeof affiliateSettingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(affiliateSettingsSchema) });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/settings");
      const data = await res.json();
      if (res.ok) {
        reset({
          firstName: data.profile.first_name,
          lastName: data.profile.last_name,
          paypalEmail: data.affiliate.paypal_email ?? "",
          iban: data.affiliate.iban ?? "",
          bic: data.affiliate.bic ?? "",
          cryptoWalletAddress: data.affiliate.crypto_wallet_address ?? "",
          taxId: data.affiliate.tax_id ?? "",
          preferredPayoutMethod: data.affiliate.preferred_payout_method ?? "paypal",
        });
        setTwoFactorEnabled(data.profile.two_factor_enabled);
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
      const res = await fetch("/api/affiliate/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Speichern fehlgeschlagen");
        return;
      }
      toast.success("Einstellungen gespeichert!");
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
  };

  const startTwoFactorSetup = async () => {
    const res = await fetch("/api/affiliate/2fa");
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Setup fehlgeschlagen");
      return;
    }
    const dataUrl = await QRCode.toDataURL(data.otpAuthUrl, { width: 200 });
    setQrDataUrl(dataUrl);
    setSetupMode(true);
  };

  const confirmTwoFactor = async () => {
    setVerifying(true);
    try {
      const res = await fetch("/api/affiliate/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Verifizierung fehlgeschlagen");
        return;
      }
      toast.success("2FA aktiviert!");
      setTwoFactorEnabled(true);
      setSetupMode(false);
      setTotpCode("");
    } finally {
      setVerifying(false);
    }
  };

  const disableTwoFactor = async () => {
    const res = await fetch("/api/affiliate/2fa", { method: "DELETE" });
    if (res.ok) {
      toast.success("2FA deaktiviert.");
      setTwoFactorEnabled(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-white/[0.05] rounded animate-pulse" />
        <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-1">Verwalte dein Profil und deine Auszahlungsdaten.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil &amp; Auszahlung</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Vorname</Label>
              <Input id="firstName" {...register("firstName")} error={!!errors.firstName} />
            </div>
            <div>
              <Label htmlFor="lastName">Nachname</Label>
              <Input id="lastName" {...register("lastName")} error={!!errors.lastName} />
            </div>
          </div>

          <div>
            <Label htmlFor="preferredPayoutMethod">Bevorzugte Auszahlungsmethode</Label>
            <select
              id="preferredPayoutMethod"
              {...register("preferredPayoutMethod")}
              className="flex h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-foreground"
            >
              <option value="paypal">PayPal</option>
              <option value="sepa">SEPA-Überweisung</option>
              <option value="crypto">Krypto-Wallet</option>
            </select>
          </div>

          <div>
            <Label htmlFor="paypalEmail">PayPal E-Mail</Label>
            <Input id="paypalEmail" type="email" {...register("paypalEmail")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" {...register("iban")} />
            </div>
            <div>
              <Label htmlFor="bic">BIC</Label>
              <Input id="bic" {...register("bic")} />
            </div>
          </div>

          <div>
            <Label htmlFor="cryptoWalletAddress">Krypto-Wallet-Adresse</Label>
            <Input id="cryptoWalletAddress" {...register("cryptoWalletAddress")} />
          </div>

          <div>
            <Label htmlFor="taxId">Steuernummer</Label>
            <Input id="taxId" {...register("taxId")} />
          </div>

          <Button type="submit" loading={submitting}>
            Speichern
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
        </CardHeader>

        {twoFactorEnabled ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-success text-sm">
              <ShieldCheck className="h-4 w-4" /> 2FA ist aktiviert
            </div>
            <Button variant="destructive" size="sm" onClick={disableTwoFactor}>
              <ShieldOff className="h-3.5 w-3.5" /> Deaktivieren
            </Button>
          </div>
        ) : setupMode ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scanne den QR-Code mit einer Authenticator-App (z. B. Google Authenticator, Authy) und gib den 6-stelligen Code ein.
            </p>
            {qrDataUrl && (
              <div className="flex justify-center bg-white rounded-xl p-4 w-fit mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="2FA QR-Code" width={180} height={180} />
              </div>
            )}
            <div className="flex gap-2 max-w-xs mx-auto">
              <Input
                placeholder="123456"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
              <Button onClick={confirmTwoFactor} loading={verifying}>
                Bestätigen
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Schütze dein Konto zusätzlich mit 2FA.</p>
            <Button variant="secondary" size="sm" onClick={startTwoFactorSetup}>
              <ShieldCheck className="h-3.5 w-3.5" /> Aktivieren
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
