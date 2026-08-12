import React, { useState, useEffect } from "react";
import { UserCheck, Flame, CheckCircle, AlertCircle } from "lucide-react";
import api from "../api";

export default function AssignmentPanel({ user, bases, equipmentTypes }) {
  const [activeSubTab, setActiveSubTab] = useState("assignment");

  const [assignForm, setAssignForm] = useState({
    baseId: user.role === "ADMIN" ? "" : user.baseId || "",
    equipmentTypeId: "",
    personnel: "",
    quantity: "",
    notes: ""
  });

  const [expendForm, setExpendForm] = useState({
    baseId: user.role === "ADMIN" ? "" : user.baseId || "",
    equipmentTypeId: "",
    reason: "",
    quantity: "",
    notes: ""
  });

  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const [assignRes, expendRes] = await Promise.all([
        api.get("/assignments"),
        api.get("/expenditures")
      ]);
      setAssignments(assignRes.data);
      setExpenditures(expendRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAssignSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post("/assignments", {
        baseId: Number(assignForm.baseId),
        equipmentTypeId: Number(assignForm.equipmentTypeId),
        personnel: assignForm.personnel,
        quantity: Number(assignForm.quantity),
        notes: assignForm.notes
      });

      setMessage({ type: "success", text: res.data.message || "Assignment recorded successfully." });
      setAssignForm({
        baseId: user.role === "ADMIN" ? "" : user.baseId || "",
        equipmentTypeId: "",
        personnel: "",
        quantity: "",
        notes: ""
      });
      fetchRecords();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to record assignment." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExpendSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post("/expenditures", {
        baseId: Number(expendForm.baseId),
        equipmentTypeId: Number(expendForm.equipmentTypeId),
        reason: expendForm.reason,
        quantity: Number(expendForm.quantity),
        notes: expendForm.notes
      });

      setMessage({ type: "success", text: res.data.message || "Expenditure recorded successfully." });
      setExpendForm({
        baseId: user.role === "ADMIN" ? "" : user.baseId || "",
        equipmentTypeId: "",
        reason: "",
        quantity: "",
        notes: ""
      });
      fetchRecords();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to record expenditure." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="essex-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-widest flex items-center space-x-3 font-serif-heading">
            <UserCheck className="w-6 h-6 text-purple-400" />
            <span>DEPLOYMENT & STOCK CONSUMPTION</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Track equipment assigned to military units vs consumed ammunition / expended stock.
          </p>
        </div>

        <div className="flex space-x-2 bg-[#080c14] p-1.5 rounded-2xl border border-[#26334d] font-mono">
          <button
            onClick={() => { setActiveSubTab("assignment"); setMessage(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold font-serif-heading uppercase tracking-wider transition-all ${
              activeSubTab === "assignment"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => { setActiveSubTab("expenditure"); setMessage(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold font-serif-heading uppercase tracking-wider transition-all ${
              activeSubTab === "expenditure"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Expenditures</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="essex-card p-6 space-y-4">
          {activeSubTab === "assignment" ? (
            <>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Assign Equipment</span>
              </h3>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                    Station Base
                  </label>
                  <select
                    disabled={user.role !== "ADMIN"}
                    required
                    value={assignForm.baseId}
                    onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })}
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
                    value={assignForm.equipmentTypeId}
                    onChange={(e) => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })}
                    className="w-full"
                  >
                    <option value="">Select Equipment</option>
                    {equipmentTypes?.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                    Personnel / Unit
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101st Recon Battalion"
                    value={assignForm.personnel}
                    onChange={(e) => setAssignForm({ ...assignForm, personnel: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                    Assigned Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Quantity > 0"
                    value={assignForm.quantity}
                    onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })}
                    className="w-full font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Operation order reference..."
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
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
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all font-serif-heading shadow-lg shadow-purple-500/20"
                >
                  {isSubmitting ? "Recording..." : "Record Personnel Assignment"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Record Stock Expenditure</span>
              </h3>

              <form onSubmit={handleExpendSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                    Station Base
                  </label>
                  <select
                    disabled={user.role !== "ADMIN"}
                    required
                    value={expendForm.baseId}
                    onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })}
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
                    Expended Item
                  </label>
                  <select
                    required
                    value={expendForm.equipmentTypeId}
                    onChange={(e) => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })}
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
                    Expenditure Reason
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Training exercise"
                    value={expendForm.reason}
                    onChange={(e) => setExpendForm({ ...expendForm, reason: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                    Expended Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Quantity > 0"
                    value={expendForm.quantity}
                    onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })}
                    className="w-full font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                    Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Authorization details..."
                    value={expendForm.notes}
                    onChange={(e) => setExpendForm({ ...expendForm, notes: e.target.value })}
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
                  className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all font-serif-heading shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? "Recording..." : "Record Expended Stock"}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="lg:col-span-2 essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
            {activeSubTab === "assignment" ? "Personnel Assignment Logs" : "Ammunition & Stock Expenditure Logs"}
          </h3>

          <div className="overflow-x-auto border border-[#26334d] rounded-2xl">
            {activeSubTab === "assignment" ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
                  <tr>
                    <th className="p-3.5">Equipment</th>
                    <th className="p-3.5">Assigned To</th>
                    <th className="p-3.5 text-right">Quantity</th>
                    <th className="p-3.5">Base</th>
                    <th className="p-3.5">Recorded By</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-[#172033]/60">
                      <td className="p-3.5 font-bold text-slate-100 font-serif-heading">{a.equipmentType.name}</td>
                      <td className="p-3.5 text-purple-300 font-semibold">{a.personnel}</td>
                      <td className="p-3.5 text-right font-bold text-purple-400">-{a.quantity.toLocaleString()}</td>
                      <td className="p-3.5 text-slate-300">{a.base.name}</td>
                      <td className="p-3.5 text-slate-400">{a.createdBy.name}</td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
                  <tr>
                    <th className="p-3.5">Equipment</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5 text-right">Quantity</th>
                    <th className="p-3.5">Base</th>
                    <th className="p-3.5">Recorded By</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
                  {expenditures.map((e) => (
                    <tr key={e.id} className="hover:bg-[#172033]/60">
                      <td className="p-3.5 font-bold text-slate-100 font-serif-heading">{e.equipmentType.name}</td>
                      <td className="p-3.5 text-orange-300">{e.reason}</td>
                      <td className="p-3.5 text-right font-bold text-orange-400">-{e.quantity.toLocaleString()}</td>
                      <td className="p-3.5 text-slate-300">{e.base.name}</td>
                      <td className="p-3.5 text-slate-400">{e.createdBy.name}</td>
                      <td className="p-3.5 text-slate-500 text-[10px]">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
