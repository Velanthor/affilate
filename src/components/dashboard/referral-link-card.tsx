"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, Check, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReferralLinkCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://velanthor.org";
  const referralLink = `${appUrl}/?ref=${referralCode}`;

  useEffect(() => {
    QRCode.toDataURL(referralLink, {
      width: 240,
      margin: 1,
      color: { dark: "#0c1020", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [referralLink]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `velanthor-referral-${referralCode}.png`;
    link.click();
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="h-4 w-4 text-accent-cyan" />
        <h3 className="font-semibold text-foreground">Dein Referral-Link</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Referral-Code</p>
            <div className="font-mono text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-accent-cyan inline-block">
              {referralCode}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Vollständiger Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-xs sm:text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 truncate text-foreground/90">
                {referralLink}
              </div>
              <Button size="icon" variant="secondary" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button size="sm" variant="secondary" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" /> Link kopieren
            </Button>
            <Button size="sm" variant="secondary" onClick={handleDownloadQr}>
              <Download className="h-3.5 w-3.5" /> QR herunterladen
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center bg-white rounded-xl p-3 self-center shrink-0">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Referral QR-Code" width={140} height={140} />
          ) : (
            <div className="h-[140px] w-[140px] bg-gray-100 animate-pulse rounded-lg" />
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
