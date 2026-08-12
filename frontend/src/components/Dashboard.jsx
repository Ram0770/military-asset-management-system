import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  Calculator,
  Search,
  Filter,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  Flame,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from "lucide-react";
import api from "../api";
import NetMovementModal from "./NetMovementModal";

const CATEGORY_COLORS = {
  VEHICLE: "#38bdf8",
  WEAPON: "#f43f5e",
  AMMUNITION: "#10b981",
  EQUIPMENT: "#e2b857"
};

export default function Dashboard({ user, bases, equipmentTypes }) {
  const [filters, setFilters] = useState({
    baseId: user.role === "ADMIN" ? "" : user.baseId || "",
    equipmentTypeId: "",
    startDate: "",
    endDate: "",
    search: ""
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNetModal, setShowNetModal] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [filters.baseId, filters.equipmentTypeId, filters.startDate, filters.endDate]);

  async function fetchDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const [dashRes, assetsRes] = await Promise.all([
        api.get("/assets/dashboard", {
          params: {
            ...(filters.baseId && { baseId: filters.baseId }),
            ...(filters.equipmentTypeId && { equipmentTypeId: filters.equipmentTypeId }),
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate })
          }
        }),
        api.get("/assets", {
          params: {
            ...(filters.baseId && { baseId: filters.baseId }),
            ...(filters.equipmentTypeId && { equipmentTypeId: filters.equipmentTypeId }),
            ...(filters.search && { search: filters.search })
          }
        })
      ]);

      setDashboardData(dashRes.data);
      setAssets(assetsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load operational dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  const metrics = dashboardData?.metrics || {
    openingBalance: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    netMovement: 0,
    assigned: 0,
    expended: 0,
    closingBalance: 0
  };

  const filteredAssets = assets.filter((a) => {
    if (!filters.search) return true;
    return (
      a.equipmentType.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      a.base.name.toLowerCase().includes(filters.search.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header Banner - Squarespace Essex Fluid Style */}
      <div className="essex-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-[11px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full uppercase flex items-center">
              <Sparkles className="w-3 h-3 mr-1.5 text-amber-400" /> Role: {user.role}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Base Scope: {user.baseName || "All Theater Installations"}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 uppercase tracking-widest font-serif-heading">
            CONSOLIDATED INVENTORY READINESS POSTURE
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Dynamic Opening Balance & Net Movement tracking across active military installations.
          </p>
        </div>

        <button
          onClick={() => setShowNetModal(true)}
          className="flex items-center space-x-2.5 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-sky-500/20 shrink-0 font-serif-heading z-10"
        >
          <Calculator className="w-4 h-4 text-slate-950" />
          <span>Inspect Net Movement Formula</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="essex-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-sky-400 uppercase">
            <Filter className="w-4 h-4" />
            <span>Search & Filter Criteria</span>
          </div>
          {(filters.baseId || filters.equipmentTypeId || filters.startDate || filters.endDate || filters.search) && (
            <button
              onClick={() =>
                setFilters({
                  baseId: user.role === "ADMIN" ? "" : user.baseId || "",
                  equipmentTypeId: "",
                  startDate: "",
                  endDate: "",
                  search: ""
                })
              }
              className="text-[11px] font-mono text-slate-400 hover:text-sky-400 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
              Military Installation
            </label>
            <select
              disabled={user.role !== "ADMIN"}
              value={filters.baseId}
              onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
              className="w-full"
            >
              {user.role === "ADMIN" && <option value="">All Theater Bases</option>}
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
              value={filters.equipmentTypeId}
              onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}
              className="w-full"
            >
              <option value="">All Equipment Types</option>
              {equipmentTypes?.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.name} ({eq.category})</option>
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
              className="w-full text-xs font-mono"
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
              className="w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
              Search Asset
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 8 STAT CARDS GRID - Squarespace Essex Fluid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {/* Card 1: Opening Balance */}
        <div className="essex-card p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase">Opening</span>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-100 font-mono mt-2">
            {metrics.openingBalance.toLocaleString()}
          </p>
          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Opening Stock</p>
        </div>

        {/* Card 2: Purchases */}
        <div className="essex-card p-4 border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-mono font-bold uppercase">+ Purchases</span>
            <PlusCircle className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-emerald-300 font-mono mt-2">
            +{metrics.purchases.toLocaleString()}
          </p>
          <p className="text-[9px] text-emerald-500/80 font-mono mt-0.5">Inbound</p>
        </div>

        {/* Card 3: Transfers In */}
        <div className="essex-card p-4 border-sky-500/30">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[10px] font-mono font-bold uppercase">+ Transfers In</span>
            <ArrowDownLeft className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-sky-300 font-mono mt-2">
            +{metrics.transfersIn.toLocaleString()}
          </p>
          <p className="text-[9px] text-sky-500/80 font-mono mt-0.5">Incoming</p>
        </div>

        {/* Card 4: Transfers Out */}
        <div className="essex-card p-4 border-rose-500/30">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[10px] font-mono font-bold uppercase">- Transfers Out</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-rose-300 font-mono mt-2">
            -{metrics.transfersOut.toLocaleString()}
          </p>
          <p className="text-[9px] text-rose-500/80 font-mono mt-0.5">Outgoing</p>
        </div>

        {/* Card 5: Net Movement (CLICKABLE MODAL TRIGGER) */}
        <button
          type="button"
          onClick={() => setShowNetModal(true)}
          className="essex-card-gold p-4 text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-mono font-bold uppercase group-hover:underline">
              Net Movement
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className={`text-xl font-bold font-mono mt-2 ${metrics.netMovement >= 0 ? "text-amber-300" : "text-rose-400"}`}>
            {metrics.netMovement >= 0 ? `+${metrics.netMovement.toLocaleString()}` : metrics.netMovement.toLocaleString()}
          </p>
          <p className="text-[9px] text-amber-400/80 font-mono mt-0.5">Breakdown &rarr;</p>
        </button>

        {/* Card 6: Assigned */}
        <div className="essex-card p-4 border-purple-500/30">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[10px] font-mono font-bold uppercase">- Assigned</span>
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-purple-300 font-mono mt-2">
            -{metrics.assigned.toLocaleString()}
          </p>
          <p className="text-[9px] text-purple-500/80 font-mono mt-0.5">Personnel</p>
        </div>

        {/* Card 7: Expended */}
        <div className="essex-card p-4 border-orange-500/30">
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-[10px] font-mono font-bold uppercase">- Expended</span>
            <Flame className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-orange-300 font-mono mt-2">
            -{metrics.expended.toLocaleString()}
          </p>
          <p className="text-[9px] text-orange-500/80 font-mono mt-0.5">Consumed</p>
        </div>

        {/* Card 8: Closing Balance */}
        <div className="essex-card p-4 border-emerald-500/50 bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-mono font-bold uppercase">Closing Balance</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-emerald-300 font-mono mt-2">
            {metrics.closingBalance.toLocaleString()}
          </p>
          <p className="text-[9px] text-emerald-400/80 font-mono mt-0.5">Active Stock</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="essex-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
              Stock Distribution by Category
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Units Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.stockByCategory || []}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#26334d", borderRadius: "12px" }}
                  labelStyle={{ color: "#f8fafc", fontWeight: "bold" }}
                />
                <Bar dataKey="totalQuantity" radius={[8, 8, 0, 0]}>
                  {dashboardData?.stockByCategory?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || "#38bdf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="essex-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
              Base Inventory Volume
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Installation Totals</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.stockByBase || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="baseName" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#26334d", borderRadius: "12px" }}
                />
                <Bar dataKey="totalQuantity" fill="#38bdf8" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ASSET BALANCES TABLE */}
      <div className="essex-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
              Live Asset Inventory Posture
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Detailed listing of verified stock levels across controlled installations
            </p>
          </div>

          <span className="text-xs font-mono px-3.5 py-1.5 bg-[#080c14] border border-[#26334d] text-sky-400 rounded-xl self-start">
            Showing {filteredAssets.length} asset records
          </span>
        </div>

        <div className="overflow-x-auto border border-[#26334d] rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
              <tr>
                <th className="p-3.5">Asset Equipment</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Station Base</th>
                <th className="p-3.5 text-right">Available Qty</th>
                <th className="p-3.5">Operational Status</th>
                <th className="p-3.5">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#172033]/60 transition-colors">
                  <td className="p-3.5 font-bold text-slate-100 font-serif-heading tracking-wide">
                    {asset.equipmentType.name}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-[#080c14] text-sky-400 border border-sky-500/30">
                      {asset.equipmentType.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{asset.base.name}</td>
                  <td className="p-3.5 text-right font-bold text-slate-100">
                    {asset.quantity.toLocaleString()} {asset.equipmentType.unit}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        asset.status === "OPERATIONAL"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : asset.status === "MAINTENANCE"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 text-[10px]">
                    {new Date(asset.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic font-mono">
                    No active assets match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NET MOVEMENT FORMULA MODAL */}
      {showNetModal && (
        <NetMovementModal
          metrics={metrics}
          breakdown={dashboardData?.itemizedBreakdown}
          onClose={() => setShowNetModal(false)}
        />
      )}
    </div>
  );
}
