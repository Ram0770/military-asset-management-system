import React, { useState, useEffect } from "react";
import { ArrowLeftRight, CheckCircle, AlertCircle, Send } from "lucide-react";
import api from "../api";

export default function TransferPanel({ user, bases, equipmentTypes }) {
  const [form, setForm] = useState({
    sourceBaseId: user.role === "ADMIN" ? "" : user.baseId || "",
    destinationBaseId: "",
    equipmentTypeId: "",
    quantity: "",
    notes: ""
  });

  const [transfers, setTransfers] = useState([]);
  const [availableStock, setAvailableStock] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTransfers();
  }, []);

  useEffect(() => {
    checkAvailableStock();
  }, [form.sourceBaseId, form.equipmentTypeId]);

  async function fetchTransfers() {
    try {
      const res = await api.get("/transfers");
      setTransfers(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function checkAvailableStock() {
    if (!form.sourceBaseId || !form.equipmentTypeId) {
      setAvailableStock(null);
      return;
    }

    try {
      const res = await api.get("/assets", {
        params: {
          baseId: form.sourceBaseId,
          equipmentTypeId: form.equipmentTypeId
        }
      });

      if (res.data && res.data.length > 0) {
        setAvailableStock(res.data[0].quantity);
      } else {
        setAvailableStock(0);
      }
    } catch {
      setAvailableStock(0);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (Number(form.sourceBaseId) === Number(form.destinationBaseId)) {
      setMessage({ type: "error", text: "Source base and destination base cannot be identical." });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await api.post("/transfers", {
        sourceBaseId: Number(form.sourceBaseId),
        destinationBaseId: Number(form.destinationBaseId),
        equipmentTypeId: Number(form.equipmentTypeId),
        quantity: Number(form.quantity),
        notes: form.notes
      });

      setMessage({ type: "success", text: res.data.message || "Transfer completed successfully." });
      setForm({
        sourceBaseId: user.role === "ADMIN" ? "" : user.baseId || "",
        destinationBaseId: "",
        equipmentTypeId: "",
        quantity: "",
        notes: ""
      });
      setAvailableStock(null);
      fetchTransfers();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Transfer transaction failed." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="essex-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-widest flex items-center space-x-3 font-serif-heading">
            <ArrowLeftRight className="w-6 h-6 text-sky-400" />
            <span>CROSS-BASE ATOMIC TRANSFERS</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Relocate inventory across military bases with verified database transaction safety.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading flex items-center space-x-2">
            <Send className="w-4 h-4 text-sky-400" />
            <span>Initiate Transfer</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Source Base (From)
              </label>
              <select
                disabled={user.role !== "ADMIN"}
                required
                value={form.sourceBaseId}
                onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
                className="w-full"
              >
                <option value="">Select Source Base</option>
                {bases?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Destination Base (To)
              </label>
              <select
                required
                value={form.destinationBaseId}
                onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })}
                className="w-full"
              >
                <option value="">Select Destination Base</option>
                {bases?.filter((b) => b.id !== Number(form.sourceBaseId)).map((b) => (
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

            {availableStock !== null && (
              <div className={`p-3 rounded-xl font-mono text-xs border ${
                availableStock > 0 ? "bg-[#080c14] border-sky-500/40 text-sky-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                Available Stock at Source: <strong className="text-slate-100">{availableStock}</strong> units
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Transfer Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="Quantity to transfer"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Directive / Purpose
              </label>
              <textarea
                rows={2}
                placeholder="Transfer order reference..."
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
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all font-serif-heading shadow-lg shadow-sky-500/20"
            >
              {isSubmitting ? "Executing..." : "Execute Atomic Transfer"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
            Cross-Base Transfer Audit Log
          </h3>

          <div className="overflow-x-auto border border-[#26334d] rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
                <tr>
                  <th className="p-3.5">Equipment</th>
                  <th className="p-3.5">From Base</th>
                  <th className="p-3.5">To Base</th>
                  <th className="p-3.5 text-right">Quantity</th>
                  <th className="p-3.5">Initiated By</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#172033]/60">
                    <td className="p-3.5 font-bold text-slate-100 font-serif-heading">{t.equipmentType.name}</td>
                    <td className="p-3.5 text-rose-400">{t.sourceBase.name}</td>
                    <td className="p-3.5 text-emerald-400">{t.destinationBase.name}</td>
                    <td className="p-3.5 text-right font-bold text-sky-400">{t.quantity.toLocaleString()} {t.equipmentType.unit}</td>
                    <td className="p-3.5 text-slate-400">{t.createdBy.name}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 text-[10px]">{new Date(t.createdAt).toLocaleDateString()}</td>
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
