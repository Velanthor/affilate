"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export function EarningsCalculator() {
  const [referrals, setReferrals] = useState(20);
  const [avgOrderValue, setAvgOrderValue] = useState(150);
  const [commissionRate, setCommissionRate] = useState(20);

  const monthlyEarnings = useMemo(
    () => (referrals * avgOrderValue * commissionRate) / 100,
    [referrals, avgOrderValue, commissionRate]
  );
  const yearlyEarnings = monthlyEarnings * 12;

  return (
    <section id="calculator" className="container py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold">Verdienstrechner</h2>
        <p className="mt-4 text-muted-foreground">
          Berechne dein potenzielles monatliches Einkommen als VELANTHOR-Partner.
        </p>
      </div>

      <div className="glass-card max-w-3xl mx-auto p-8 grid md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <SliderField
            label="Empfehlungen pro Monat"
            value={referrals}
            min={1}
            max={200}
            onChange={setReferrals}
            suffix=""
          />
          <SliderField
            label="Ø Bestellwert"
            value={avgOrderValue}
            min={20}
            max={1000}
            step={10}
            onChange={setAvgOrderValue}
            suffix="€"
          />
          <SliderField
            label="Provisionssatz"
            value={commissionRate}
            min={5}
            max={30}
            onChange={setCommissionRate}
            suffix="%"
          />
        </div>

        <div className="flex flex-col justify-center items-center rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8">
          <span className="text-sm text-muted-foreground">Geschätztes Einkommen pro Monat</span>
          <motion.span
            key={monthlyEarnings}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-display font-extrabold gradient-text mt-2"
          >
            {formatCurrency(monthlyEarnings)}
          </motion.span>
          <span className="text-sm text-muted-foreground mt-6">Pro Jahr</span>
          <span className="text-2xl font-semibold text-foreground mt-1">
            {formatCurrency(yearlyEarnings)}
          </span>
        </div>
      </div>
    </section>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-3">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-white/[0.1] accent-primary-500 cursor-pointer"
      />
    </div>
  );
}
