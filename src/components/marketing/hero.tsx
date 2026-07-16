"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 grid-bg">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-accent-cyan/10 blur-[100px] animate-float" />
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8"
        >
          <TrendingUp className="h-3.5 w-3.5 text-accent-cyan" />
          Bis zu 30% Lifetime-Provision auf jede Empfehlung
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.05]"
        >
          Verdiene mit
          <span className="gradient-text block md:inline"> VELANTHOR</span>
          <br />
          <span className="text-foreground">Partnerprogramm</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground"
        >
          Empfehle die führende KI-gestützte Krypto-Analyse-Plattform und
          erhalte wiederkehrende Provisionen — transparent, in Echtzeit,
          ohne Limits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button size="lg" variant="default" asChild>
            <Link href="/register">
              Partner werden <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              <LayoutDashboard className="h-4 w-4" /> Dashboard ansehen
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-8 sm:gap-16 text-center"
        >
          {[
            ["30%", "Max. Provision"],
            ["90 Tage", "Cookie-Laufzeit"],
            ["24h", "Auszahlungs-Prüfung"],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">{value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
