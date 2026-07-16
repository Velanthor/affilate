"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { forgotPasswordSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type FormInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: FormInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error ?? "Etwas ist schiefgelaufen.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-extrabold gradient-text">
            VELANTHOR
          </Link>
          <h1 className="text-2xl font-bold mt-4">Passwort vergessen</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gib deine E-Mail-Adresse ein, wir senden dir einen Link zum Zurücksetzen.
          </p>
        </div>

        <Card>
          {sent ? (
            <p className="text-sm text-center text-muted-foreground">
              Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.
              Bitte prüfe dein Postfach.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" {...register("email")} error={!!errors.email} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" loading={submitting}>
                Link senden
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary-400 hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
