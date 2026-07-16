"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { resetPasswordSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type FormInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: FormInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Zurücksetzen fehlgeschlagen.");
        return;
      }
      toast.success("Passwort erfolgreich geändert!");
      router.push("/login");
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-sm text-center">
          <p className="text-sm text-muted-foreground">Ungültiger oder fehlender Reset-Link.</p>
          <Button asChild variant="secondary" className="w-full mt-4">
            <Link href="/forgot-password">Neuen Link anfordern</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-lg font-extrabold gradient-text">
            VELANTHOR
          </Link>
          <h1 className="text-2xl font-bold mt-4">Neues Passwort festlegen</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("token")} />
            <div>
              <Label htmlFor="password">Neues Passwort</Label>
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
            <Button type="submit" className="w-full" loading={submitting}>
              Passwort ändern
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
