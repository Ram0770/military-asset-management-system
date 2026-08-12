import React, { useState, useEffect } from "react";
import { FileText, Filter } from "lucide-react";
import api from "../api";

export default function AuditLogsPanel({ bases }) {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: "",
    baseId: "",
    startDate: "",
    endDate: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  async function fetchAuditLogs() {
    setIsLoading(true);
    try {
      const res = await api.get("/audit-logs", {
        params: {
          ...(filters.action && { action: filters.action }),
          ...(filters.baseId && { baseId: filters.baseId }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate })
        }
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="essex-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-widest flex items-center space-x-3 font-serif-heading">
            <FileText className="w-6 h-6 text-sky-400" />
            <span>IMMUTABLE SYSTEM AUDIT TRAIL (ADMIN ONLY)</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Audit logs for all security, authentication, purchase, transfer, and stock events.
          </p>
        </div>
      </div>

      <div className="essex-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-sky-400 uppercase flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Audit Search Filters</span>
          </span>
          {(filters.action || filters.baseId || filters.startDate || filters.endDate) && (
            <button
              onClick={() => setFilters({ action: "", baseId: "", startDate: "", endDate: "" })}
              className="text-[11px] font-mono text-slate-400 hover:text-sky-400 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
              Action Type
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full"
            >
              <option value="">All Actions</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="ASSIGNMENT">ASSIGNMENT</option>
              <option value="EXPENDITURE">EXPENDITURE</option>
              <option value="AUTH">AUTH</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
              Station Base
            </label>
            <select
              value={filters.baseId}
              onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
              className="w-full"
            >
              <option value="">All Bases</option>
              {bases?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full font-mono text-xs"
            />
          </div>
        </div>
      </div>

      <div className="essex-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
            Recorded Audit Log Stream
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {logs.length} logs retrieved
          </span>
        </div>

        <div className="overflow-x-auto border border-[#26334d] rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Officer User</th>
                <th className="p-3.5">Base Scope</th>
                <th className="p-3.5">Event Details</th>
                <th className="p-3.5">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#172033]/60">
                  <td className="p-3.5 text-slate-400 text-[10px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      log.action === "PURCHASE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      log.action === "TRANSFER" ? "bg-sky-500/10 text-sky-400 border-sky-500/30" :
                      log.action === "ASSIGNMENT" ? "bg-purple-500/10 text-purple-400 border-purple-500/30" :
                      log.action === "EXPENDITURE" ? "bg-orange-500/10 text-orange-400 border-orange-500/30" :
                      log.action === "AUTH" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                      "bg-[#080c14] text-slate-300 border-[#26334d]"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-200 font-bold font-serif-heading">{log.user?.name || "System Automated"}</td>
                  <td className="p-3.5 text-slate-400">{log.base?.name || "Global"}</td>
                  <td className="p-3.5 text-slate-300">{log.details}</td>
                  <td className="p-3.5 text-sky-400 font-mono text-[10px]">{log.entityRef || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
