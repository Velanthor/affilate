"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [needsTotp, setNeedsTotp] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        if (result.code === "TOTP_REQUIRED") {
          setNeedsTotp(true);
          toast("Bitte gib deinen 2FA-Code ein", { icon: "🔐" });
          return;
        }
        toast.error(result.error ?? "Login fehlgeschlagen");
        return;
      }

      toast.success("Erfolgreich eingeloggt!");
      const redirect = searchParams.get("redirect") ?? "/dashboard";
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-extrabold gradient-text">
            VELANTHOR
          </Link>
          <h1 className="text-2xl font-bold mt-4">Willkommen zurück</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" {...register("email")} error={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="password" className="mb-0">
                  Passwort
                </Label>
                <Link href="/forgot-password" className="text-xs text-primary-400 hover:underline">
                  Vergessen?
                </Link>
              </div>
              <Input id="password" type="password" {...register("password")} error={!!errors.password} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            {needsTotp && (
              <div>
                <Label htmlFor="totpCode">2FA-Code</Label>
                <Input id="totpCode" placeholder="123456" maxLength={6} {...register("totpCode")} />
              </div>
            )}

            <Button type="submit" className="w-full" loading={submitting}>
              Einloggen
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-primary-400 hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
