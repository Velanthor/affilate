"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { COUNTRIES } from "@/lib/countries";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { referralCode: refCode, country: "", captchaToken: "" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Registrierung fehlgeschlagen");
        return;
      }

      setSuccess(true);
      toast.success("Registrierung erfolgreich!");
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">Fast geschafft!</h1>
          <p className="text-sm text-muted-foreground">
            Wir haben dir eine Bestätigungs-E-Mail gesendet. Bitte klicke auf den Link darin,
            um dein Konto zu aktivieren.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-extrabold gradient-text">
            VELANTHOR
          </Link>
          <h1 className="text-2xl font-bold mt-4">Werde Partner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Erstelle dein kostenloses Affiliate-Konto in 2 Minuten.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Vorname</Label>
                <Input id="firstName" {...register("firstName")} error={!!errors.firstName} />
                {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Nachname</Label>
                <Input id="lastName" {...register("lastName")} error={!!errors.lastName} />
                {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" {...register("email")} error={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" {...register("password")} error={!!errors.password} />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
                <Input id="passwordConfirm" type="password" {...register("passwordConfirm")} error={!!errors.passwordConfirm} />
                {errors.passwordConfirm && (
                  <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="country">Land</Label>
              <select
                id="country"
                {...register("country")}
                className="flex h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-foreground"
              >
                <option value="">Bitte wählen</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.country && <p className="text-xs text-destructive mt-1">{errors.country.message}</p>}
            </div>

            <div>
              <Label htmlFor="paypalEmail">PayPal E-Mail</Label>
              <Input id="paypalEmail" type="email" {...register("paypalEmail")} />
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Bankverbindung &amp; Steuerinfo (optional)
              </summary>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input id="iban" {...register("iban")} />
                </div>
                <div>
                  <Label htmlFor="bic">BIC</Label>
                  <Input id="bic" {...register("bic")} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="taxId">Steuernummer</Label>
                  <Input id="taxId" {...register("taxId")} />
                </div>
              </div>
            </details>

            {refCode && (
              <div className="text-xs text-muted-foreground bg-white/[0.03] rounded-lg px-3 py-2">
                Empfohlen von: <span className="text-accent-cyan font-medium">{refCode}</span>
              </div>
            )}
            <input type="hidden" {...register("referralCode")} />

            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={(token) => setValue("captchaToken", token)}
              theme="dark"
            />
            {errors.captchaToken && <p className="text-xs text-destructive">{errors.captchaToken.message}</p>}

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" {...register("acceptTerms")} className="mt-0.5" />
              Ich akzeptiere die{" "}
              <Link href="/agb" className="text-primary-400 hover:underline">
                AGB
              </Link>{" "}
              und{" "}
              <Link href="/datenschutz" className="text-primary-400 hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </label>
            {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>}

            <Button type="submit" className="w-full" loading={submitting}>
              Konto erstellen
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Bereits registriert?{" "}
          <Link href="/login" className="text-primary-400 hover:underline">
            Jetzt einloggen
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
