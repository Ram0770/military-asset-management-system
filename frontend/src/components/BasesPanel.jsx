import React, { useState } from "react";
import { Building2, Plus, CheckCircle, AlertCircle } from "lucide-react";
import api from "../api";

export default function BasesPanel({ bases, onRefresh }) {
  const [form, setForm] = useState({ name: "", code: "", location: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await api.post("/bases", form);
      setMessage({ type: "success", text: "Military base created successfully." });
      setForm({ name: "", code: "", location: "" });
      onRefresh();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create base." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="essex-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-widest flex items-center space-x-3 font-serif-heading">
            <Building2 className="w-6 h-6 text-sky-400" />
            <span>MILITARY BASES DIRECTORY (ADMIN ONLY)</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Configure strategic installations, outpost codes, and geographic sectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading flex items-center space-x-2">
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Register Base</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Base Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fort Alpha Outpost"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Base Code (Unique)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FB-NORTH"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Geographic Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Northern Ridge Sector"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full"
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
              {isSubmitting ? "Registering..." : "Register Military Base"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
            Active Military Bases
          </h3>

          <div className="overflow-x-auto border border-[#26334d] rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
                <tr>
                  <th className="p-3.5">Base Name</th>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
                {bases.map((b) => (
                  <tr key={b.id} className="hover:bg-[#172033]/60">
                    <td className="p-3.5 font-bold text-slate-100 font-serif-heading">{b.name}</td>
                    <td className="p-3.5 text-sky-400 font-bold">{b.code}</td>
                    <td className="p-3.5 text-slate-300">{b.location}</td>
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
