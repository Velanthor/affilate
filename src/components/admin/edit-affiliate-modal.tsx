"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface AffiliateRow {
  id: string;
  referralCode: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  defaultCommissionRate: number;
  totalCommissionEarned: number;
}

export function EditAffiliateModal({
  affiliate,
  onClose,
  onSaved,
}: {
  affiliate: AffiliateRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(affiliate.status);
  const [rate, setRate] = useState(affiliate.defaultCommissionRate);
  const [notes, setNotes] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingCommission, setAddingCommission] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, default_commission_rate: rate, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Speichern fehlgeschlagen");
        return;
      }
      toast.success("Affiliate aktualisiert!");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleAddCommission = async (sign: 1 | -1) => {
    const amount = parseFloat(manualAmount);
    if (!amount || isNaN(amount)) {
      toast.error("Bitte gültigen Betrag eingeben");
      return;
    }
    setAddingCommission(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliate.id}/commission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * sign, notes: manualNotes }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Fehlgeschlagen");
        return;
      }
      toast.success("Provision gespeichert!");
      setManualAmount("");
      setManualNotes("");
      onSaved();
    } finally {
      setAddingCommission(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">{affiliate.firstName} {affiliate.lastName}</h3>
            <p className="text-xs text-muted-foreground">{affiliate.email} · {affiliate.referralCode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-foreground"
            >
              <option value="pending">Ausstehend</option>
              <option value="active">Aktiv</option>
              <option value="suspended">Gesperrt (temporär)</option>
              <option value="banned">Gebannt</option>
            </select>
          </div>

          <div>
            <Label htmlFor="rate">Standard-Provisionssatz (%)</Label>
            <Input id="rate" type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          </div>

          <div>
            <Label htmlFor="notes">Interne Notiz</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional..." />
          </div>

          <Button onClick={handleSave} loading={saving} className="w-full">
            Änderungen speichern
          </Button>

          <div className="pt-4 border-t border-white/[0.08]">
            <p className="text-sm font-medium text-foreground mb-1">Provision manuell anpassen</p>
            <p className="text-xs text-muted-foreground mb-3">
              Aktuelles Guthaben: {formatCurrency(affiliate.totalCommissionEarned)}
            </p>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Betrag €" type="number" step="0.01" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} />
            </div>
            <Input placeholder="Notiz (optional)" value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} className="mb-3" />
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" loading={addingCommission} onClick={() => handleAddCommission(1)}>
                + Hinzufügen
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" loading={addingCommission} onClick={() => handleAddCommission(-1)}>
                − Entfernen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
