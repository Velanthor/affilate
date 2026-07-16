"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, formatPercent, cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  clicks: number;
  conversions: number;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      if (res.ok) setCampaigns(data.campaigns);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Bitte einen Namen angeben");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erstellung fehlgeschlagen");
        return;
      }
      toast.success("Kampagne erstellt!");
      setName("");
      setDescription("");
      setShowForm(false);
      loadData();
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const res = await fetch("/api/admin/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kampagnen</h1>
          <p className="text-sm text-muted-foreground mt-1">UTM-Kampagnen für die Auswertung von Marketingaktionen.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3.5 w-3.5" /> Neue Kampagne
        </Button>
      </div>

      {showForm && (
        <Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Sommer-Aktion 2026" />
            </div>
            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <Button className="mt-4" loading={creating} onClick={handleCreate}>
            Kampagne erstellen
          </Button>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />)
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">Noch keine Kampagnen erstellt.</p>
        ) : (
          campaigns.map((c) => {
            const rate = c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0;
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 border border-white/[0.08] flex items-center justify-center">
                    <Megaphone className="h-4 w-4 text-primary-300" />
                  </div>
                  <button
                    onClick={() => toggleActive(c.id, c.is_active)}
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full border",
                      c.is_active ? "text-success bg-success/10 border-success/20" : "text-muted-foreground bg-white/[0.03] border-white/[0.08]"
                    )}
                  >
                    {c.is_active ? "Aktiv" : "Pausiert"}
                  </button>
                </div>
                <h3 className="font-medium text-foreground text-sm">{c.name}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">utm_campaign={c.slug}</p>
                <div className="flex gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Klicks: </span>
                    <span className="text-foreground font-medium">{formatNumber(c.clicks)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conv.: </span>
                    <span className="text-foreground font-medium">{formatNumber(c.conversions)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rate: </span>
                    <span className="text-foreground font-medium">{formatPercent(rate)}</span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
