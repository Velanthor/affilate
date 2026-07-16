"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

const testimonials = [
  {
    name: "Marc Fischer",
    role: "Krypto-YouTuber",
    text: "Das transparenteste Partnerprogramm, das ich je genutzt habe. Live-Statistiken und pünktliche Auszahlungen — genau wie versprochen.",
  },
  {
    name: "Lena Brandt",
    role: "Trading-Community-Betreiberin",
    text: "Die Lifetime-Commission ist ein Gamechanger. Meine Community liebt VELANTHOR und ich verdiene monatlich wiederkehrend mit.",
  },
  {
    name: "Tobias Klein",
    role: "Finance-Content-Creator",
    text: "Onboarding war in 5 Minuten erledigt. Das Marketingmaterial im Dashboard hat mir enorm viel Zeit gespart.",
  },
];

export function Testimonials() {
  return (
    <section className="container py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold">Das sagen unsere Partner</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-accent-cyan text-accent-cyan" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center text-xs font-bold text-white">
                {getInitials(t.name.split(" ")[0], t.name.split(" ")[1] ?? "")}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
