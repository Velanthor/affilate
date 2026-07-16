"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Kein Bestätigungs-Token gefunden.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message ?? "Bestätigung fehlgeschlagen.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary-400 mx-auto mb-4" />
            <p className="text-muted-foreground">E-Mail wird bestätigt...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">E-Mail bestätigt!</h1>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Button asChild className="w-full">
              <Link href="/login">Zum Login</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Bestätigung fehlgeschlagen</h1>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">Zurück zum Login</Link>
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
