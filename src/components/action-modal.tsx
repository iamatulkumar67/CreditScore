"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  type: "borrow" | "supply" | "stake";
  pools?: string[];
  onSubmit: (data: { pool?: string; amount: number; collateral?: number }) => Promise<void>;
}

export function ActionModal({ open, onClose, title, type, pools = [], onSubmit }: ActionModalProps) {
  const [pool, setPool] = useState(pools[0] || "USDC");
  const [amount, setAmount] = useState("");
  const [collateral, setCollateral] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) { setError("Enter a valid amount"); return; }
    if (type === "borrow" && (!collateral || Number(collateral) <= 0)) { setError("Enter collateral amount"); return; }
    setError("");
    setLoading(true);
    try {
      await onSubmit({ pool, amount: Number(amount), collateral: Number(collateral) });
      onClose();
      setAmount("");
      setCollateral("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0a1210] border-emerald-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-100">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {type !== "stake" && pools.length > 0 && (
            <div>
              <label className="text-xs text-emerald-100/50 mb-1 block">Pool</label>
              <select value={pool} onChange={(e) => setPool(e.target.value)} className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50">
                {pools.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-emerald-100/50 mb-1 block">{type === "stake" ? "ZKCR Amount" : "Amount (USD)"}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-100/30 focus:outline-none focus:border-emerald-500/50" />
          </div>
          {type === "borrow" && (
            <div>
              <label className="text-xs text-emerald-100/50 mb-1 block">Collateral Amount (USD)</label>
              <input type="number" value={collateral} onChange={(e) => setCollateral(e.target.value)} placeholder="0.00" className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-emerald-100/30 focus:outline-none focus:border-emerald-500/50" />
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Processing..." : `Confirm ${title}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
