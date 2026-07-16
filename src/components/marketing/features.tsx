"use client";

import { motion } from "framer-motion";
import { Percent, Zap, BarChart3, Link2, Infinity as InfinityIcon, Image } from "lucide-react";

const features = [
  {
    icon: Percent,
    title: "Hohe Provision",
    desc: "Bis zu 30% Provision auf jede erfolgreiche Empfehlung, gestaffelt nach Umsatz.",
  },
  {
    icon: Zap,
    title: "Echtzeit-Auszahlungen",
    desc: "Beantrage Auszahlungen jederzeit — Bearbeitung meist innerhalb von 24 Stunden.",
  },
  {
    icon: BarChart3,
    title: "Live-Statistiken",
    desc: "Klicks, Conversions und Umsatz in Echtzeit im Dashboard verfolgen.",
  },
  {
    icon: Link2,
    title: "Eigener Referral-Link",
    desc: "Persönlicher Tracking-Link mit 90 Tagen Cookie-Laufzeit und QR-Code.",
  },
  {
    icon: InfinityIcon,
    title: "Keine Limits",
    desc: "Unbegrenzte Empfehlungen, unbegrenzte Provisionen — dein Wachstum kennt keine Grenzen.",
  },
  {
    icon: Image,
    title: "Marketingmaterial",
    desc: "Banner, Logos, Social-Media-Vorlagen und E-Mail-Texte direkt im Dashboard.",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold">
          Alles, was du für deinen Erfolg brauchst
        </h2>
        <p className="mt-4 text-muted-foreground">
          Ein Partnerprogramm, das mit dir mitwächst — professionell, transparent, fair.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass-card p-6 group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 border border-white/[0.08] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <f.icon className="h-5 w-5 text-primary-300" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
