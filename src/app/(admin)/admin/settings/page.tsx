"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CommissionPlan {
  id: string;
  name: string;
  description: string | null;
  type: string;
  tier_1_rate: number;
  tier_2_rate: number;
  tier_3_rate: number;
  is_lifetime: boolean;
  is_default: boolean;
  is_active: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [plans, setPlans] = useState<CommissionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", tier1Rate: 20, tier2Rate: 5, tier3Rate: 2, isLifetime: true });
  const [creatingPlan, setCreatingPlan] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setPlans(data.commissionPlans);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Speichern fehlgeschlagen");
        return;
      }
      toast.success("Einstellungen gespeichert!");
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name.trim()) {
      toast.error("Bitte einen Namen angeben");
      return;
    }
    setCreatingPlan(true);
    try {
      const res = await fetch("/api/admin/commission-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erstellung fehlgeschlagen");
        return;
      }
      toast.success("Provisionsplan erstellt!");
      setNewPlan({ name: "", tier1Rate: 20, tier2Rate: 5, tier3Rate: 2, isLifetime: true });
      setShowPlanForm(false);
      loadData();
    } finally {
      setCreatingPlan(false);
    }
  };

  const setDefaultPlan = async (id: string) => {
    const res = await fetch("/api/admin/commission-plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isDefault: true }),
    });
    if (res.ok) {
      toast.success("Standard-Plan aktualisiert!");
      loadData();
    }
  };

  const togglePlanActive = async (id: string, isActive: boolean) => {
    const res = await fetch("/api/admin/commission-plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) loadData();
  };

  if (loading) {
    return <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-1">Plattformweite Konfiguration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allgemein</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_payout">Mindestauszahlungsbetrag (€)</Label>
              <Input
                id="min_payout"
                type="number"
                value={settings.payout_minimum_amount ?? 25}
                onChange={(e) => setSettings((s) => ({ ...s, payout_minimum_amount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="cookie_days">Cookie-Laufzeit (Tage)</Label>
              <Input
                id="cookie_days"
                type="number"
                value={settings.cookie_duration_days ?? 90}
                onChange={(e) => setSettings((s) => ({ ...s, cookie_duration_days: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="support_email">Support-E-Mail</Label>
            <Input
              id="support_email"
              type="email"
              value={settings.support_email ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, support_email: e.target.value }))}
            />
          </div>
          <Button onClick={handleSaveSettings} loading={saving}>
            Speichern
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Provisionspläne</CardTitle>
          <Button size="sm" variant="secondary" onClick={() => setShowPlanForm(!showPlanForm)}>
            <Plus className="h-3.5 w-3.5" /> Neuer Plan
          </Button>
        </div>

        {showPlanForm && (
          <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
            <Input placeholder="Plan-Name" value={newPlan.name} onChange={(e) => setNewPlan((p) => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="!mb-1">Ebene 1 (%)</Label>
                <Input type="number" value={newPlan.tier1Rate} onChange={(e) => setNewPlan((p) => ({ ...p, tier1Rate: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="!mb-1">Ebene 2 (%)</Label>
                <Input type="number" value={newPlan.tier2Rate} onChange={(e) => setNewPlan((p) => ({ ...p, tier2Rate: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="!mb-1">Ebene 3 (%)</Label>
                <Input type="number" value={newPlan.tier3Rate} onChange={(e) => setNewPlan((p) => ({ ...p, tier3Rate: Number(e.target.value) }))} />
              </div>
            </div>
            <Button size="sm" loading={creatingPlan} onClick={handleCreatePlan}>
              Plan erstellen
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{plan.name}</span>
                  {plan.is_default && (
                    <span className="text-[10px] font-semibold text-primary-300 bg-primary-500/10 border border-primary-500/20 rounded px-1.5 py-0.5">
                      STANDARD
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ebene 1: {plan.tier_1_rate}% · Ebene 2: {plan.tier_2_rate}% · Ebene 3: {plan.tier_3_rate}%
                  {plan.is_lifetime && " · Lifetime"}
                </div>
              </div>
              <div className="flex gap-2">
                {!plan.is_default && (
                  <Button size="sm" variant="ghost" onClick={() => setDefaultPlan(plan.id)}>
                    Als Standard
                  </Button>
                )}
                <button
                  onClick={() => togglePlanActive(plan.id, plan.is_active)}
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full border",
                    plan.is_active ? "text-success bg-success/10 border-success/20" : "text-muted-foreground bg-white/[0.03] border-white/[0.08]"
                  )}
                >
                  {plan.is_active ? "Aktiv" : "Inaktiv"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
