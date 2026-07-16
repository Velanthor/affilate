import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container pt-32 pb-24 max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-8">{title}</h1>
        <div className="prose-legal space-y-6 text-sm text-muted-foreground leading-relaxed">{children}</div>
        <div className="mt-12">
          <Link href="/" className="text-sm text-primary-400 hover:underline">
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
