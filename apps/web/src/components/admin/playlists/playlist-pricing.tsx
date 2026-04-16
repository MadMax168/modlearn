import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DollarSign, Plus, Pencil, Trash2, ArrowLeft, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// --- Types ---
type PricingWindow = {
  id: string;
  price: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
};

// Mock data
const MOCK_PRICING: PricingWindow[] = [
  { id: "pw-1", price: 199,  currency: "USD", effectiveFrom: "2024-01-01", effectiveTo: null,         isActive: true  },
  { id: "pw-2", price: 149,  currency: "USD", effectiveFrom: "2023-06-01", effectiveTo: "2023-12-31", isActive: false },
  { id: "pw-3", price: 99,   currency: "USD", effectiveFrom: "2023-01-01", effectiveTo: "2023-05-31", isActive: false },
];

const EMPTY_FORM = {
  price: "",
  currency: "USD",
  effectiveFrom: "",
  effectiveTo: "",
};

export default function PlaylistPricing({ playlistId }: { playlistId: string }) {
  const navigate = useNavigate();
  const [windows, setWindows] = useState<PricingWindow[]>(MOCK_PRICING);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const activePrice = windows.find((w) => w.isActive);

  const handleEdit = (pw: PricingWindow) => {
    setEditingId(pw.id);
    setForm({
      price: pw.price.toString(),
      currency: pw.currency,
      effectiveFrom: pw.effectiveFrom,
      effectiveTo: pw.effectiveTo ?? "",
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const handleSubmit = () => {
    if (!form.price || !form.effectiveFrom) return;

    if (editingId) {
      // TODO-Later: swap to orpc.playlist.updatePricing.mutate()
      setWindows((prev) =>
        prev.map((w) =>
          w.id === editingId
            ? { ...w, price: Number(form.price), currency: form.currency, effectiveFrom: form.effectiveFrom, effectiveTo: form.effectiveTo || null }
            : w
        )
      );
    } else {
      // TODO-Later: swap to orpc.playlist.createPricing.mutate()
      const newWindow: PricingWindow = {
        id: `pw-${Date.now()}`,
        price: Number(form.price),
        currency: form.currency,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || null,
        isActive: false,
      };
      setWindows((prev) => [...prev, newWindow]);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage pricing windows for this playlist
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate({ to: "/admin/playlists/$id", params: { id: playlistId } })}
        >
          <ArrowLeft size={16} />
          Back to Playlist
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left — Pricing Windows Table */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card">

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_80px_1fr_1fr_80px_auto] gap-4 px-6 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Price</span>
              <span>Currency</span>
              <span>Effective From</span>
              <span>Effective To</span>
              <span>Status</span>
              <span></span>
            </div>

            {/* Rows */}
            {windows.map((pw) => (
              <div
                key={pw.id}
                className="grid grid-cols-[1fr_80px_1fr_1fr_80px_auto] gap-4 items-center px-6 py-4 border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-semibold">
                  ${pw.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">{pw.currency}</span>
                <span className="text-sm text-muted-foreground">{pw.effectiveFrom}</span>
                <span className="text-sm text-muted-foreground">{pw.effectiveTo ?? "—"}</span>
                {pw.isActive
                  ? <Badge className="bg-green-100 text-green-600 hover:bg-green-100">Active</Badge>
                  : <Badge variant="secondary">Inactive</Badge>
                }
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => handleEdit(pw)}
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(pw.id)}
                    disabled={pw.isActive}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="px-6 py-3 flex justify-end">
              <Button
                variant="outline" size="sm" className="gap-2"
                onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
              >
                <Plus size={14} />
                Add Pricing Window
              </Button>
            </div>
          </div>
        </div>

        {/* Right — Active Price + Form */}
        <div className="space-y-4">

          {/* Active Price Card */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold text-sm mb-4">Current Price</h3>
            {activePrice ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">${activePrice.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Since {activePrice.effectiveFrom}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active price set</p>
            )}
          </div>

          {/* Add / Edit Form */}
          {showForm && (
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  {editingId ? "Edit Pricing Window" : "New Pricing Window"}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X size={16} />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Price ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      placeholder="0.00"
                      className="pl-7"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input
                    placeholder="USD"
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Effective From</Label>
                  <Input
                    type="date"
                    value={form.effectiveFrom}
                    onChange={(e) => set("effectiveFrom", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Effective To
                    <span className="text-muted-foreground font-normal ml-1 text-xs">(optional)</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.effectiveTo}
                    onChange={(e) => set("effectiveTo", e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full gap-2" onClick={handleSubmit}>
                <CheckCircle size={16} />
                {editingId ? "Save Changes" : "Add Pricing Window"}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}