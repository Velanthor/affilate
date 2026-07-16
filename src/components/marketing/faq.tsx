"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Wie hoch ist die Provision?",
    a: "Die Standardprovision liegt bei 20% des Bestellwerts, mit Lifetime-Commission auf wiederkehrende Zahlungen. Top-Partner erhalten bis zu 30% je nach Volumen.",
  },
  {
    q: "Wann und wie werde ich ausgezahlt?",
    a: "Du kannst jederzeit eine Auszahlung beantragen, sobald der Mindestbetrag erreicht ist. Auszahlungen erfolgen per PayPal, SEPA-Überweisung oder Krypto-Wallet, meist innerhalb von 24 Stunden.",
  },
  {
    q: "Wie lange ist die Cookie-Laufzeit?",
    a: "Dein Referral-Link setzt ein Tracking-Cookie mit 90 Tagen Laufzeit. Kunden, die innerhalb dieses Zeitraums kaufen, werden dir zugeordnet.",
  },
  {
    q: "Gibt es ein Limit für Empfehlungen?",
    a: "Nein. Du kannst unbegrenzt viele Kunden werben und unbegrenzt Provisionen verdienen.",
  },
  {
    q: "Kann ich ein Unterpartnerprogramm aufbauen?",
    a: "Ja. VELANTHOR unterstützt mehrstufige Partnerschaften — wenn du andere Partner wirbst, erhältst du zusätzlich eine Provision auf deren Umsatz.",
  },
  {
    q: "Welche Unterlagen brauche ich für die Registrierung?",
    a: "Name, E-Mail-Adresse und eine Auszahlungsmethode (z. B. PayPal). Steuerinformationen sind optional und können später ergänzt werden.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="container py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold">Häufig gestellte Fragen</h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((item, i) => (
          <div key={item.q} className="glass-card overflow-hidden !p-0">
            <button
              className="w-full flex items-center justify-between p-5 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="font-medium text-foreground">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-4",
                  openIndex === i && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
