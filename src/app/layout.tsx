import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VELANTHOR Partnerprogramm — Verdiene mit KI-gestütztem Krypto-Trading",
  description:
    "Werde VELANTHOR-Partner und verdiene bis zu 30% Lifetime-Provision auf jede Empfehlung. Live-Statistiken, Echtzeit-Auszahlungen, keine Limits.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://velanthor.org"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0c1020",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
