import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, CheckCircle, AlertCircle } from "lucide-react";
import api from "../api";

export default function PurchasePanel({ user, bases, equipmentTypes }) {
  const [form, setForm] = useState({
    baseId: user.role === "ADMIN" ? "" : user.baseId || "",
    equipmentTypeId: "",
    quantity: "",
    vendor: "",
    notes: "",
    purchaseDate: new Date().toISOString().split("T")[0]
  });

  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  async function fetchPurchases() {
    setIsLoading(true);
    try {
      const res = await api.get("/purchases");
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post("/purchases", {
        baseId: form.baseId,
        equipmentTypeId: form.equipmentTypeId,
        quantity: Number(form.quantity),
        vendor: form.vendor,
        notes: form.notes,
        purchaseDate: form.purchaseDate
      });

      setMessage({ type: "success", text: res.data.message || "Purchase recorded successfully." });
      setForm({
        baseId: user.role === "ADMIN" ? "" : user.baseId || "",
        equipmentTypeId: "",
        quantity: "",
        vendor: "",
        notes: "",
        purchaseDate: new Date().toISOString().split("T")[0]
      });
      fetchPurchases();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to record purchase." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="essex-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-widest flex items-center space-x-3 font-serif-heading">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <span>INBOUND ASSET ACQUISITION</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Record newly acquired defense assets directly into base inventory stock.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Record New Acquisition</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Destination Base
              </label>
              <select
                disabled={user.role !== "ADMIN"}
                required
                value={form.baseId}
                onChange={(e) => setForm({ ...form, baseId: e.target.value })}
                className="w-full"
              >
                <option value="">Select Base</option>
                {bases?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Equipment Item
              </label>
              <select
                required
                value={form.equipmentTypeId}
                onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
                className="w-full"
              >
                <option value="">Select Equipment</option>
                {equipmentTypes?.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Acquired Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="Quantity > 0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Vendor / Contractor
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Defense Tactical Corp"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                required
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Contract Notes
              </label>
              <textarea
                rows={2}
                placeholder="Contract reference..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full text-xs"
              />
            </div>

            {message && (
              <div className={`p-3.5 rounded-xl text-xs font-mono flex items-center space-x-2 ${
                message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
              }`}>
                {message.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all font-serif-heading shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? "Committing..." : "Confirm & Commit Purchase"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
            Historical Asset Acquisition Log
          </h3>

          <div className="overflow-x-auto border border-[#26334d] rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
                <tr>
                  <th className="p-3.5">Equipment</th>
                  <th className="p-3.5 text-right">Quantity</th>
                  <th className="p-3.5">Base</th>
                  <th className="p-3.5">Vendor</th>
                  <th className="p-3.5">Recorded By</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-[#172033]/60">
                    <td className="p-3.5 font-bold text-slate-100 font-serif-heading">{p.equipmentType.name}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">+{p.quantity.toLocaleString()} {p.equipmentType.unit}</td>
                    <td className="p-3.5 text-slate-300">{p.base.name}</td>
                    <td className="p-3.5 text-sky-400">{p.vendor}</td>
                    <td className="p-3.5 text-slate-400">{p.createdBy.name}</td>
                    <td className="p-3.5 text-slate-500 text-[10px]">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
