"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const COLORS = ["#3d5cff", "#22d3ee", "#a855f7", "#10b981", "#f59e0b", "#5c81ff", "#8babff", "#2c3ef0"];

export function BreakdownBarChart({ data, height = 220 }: { data: { name: string; count: number }[]; height?: number }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          width={90}
          stroke="rgba(255,255,255,0.5)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0c1020",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 12,
          }}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
