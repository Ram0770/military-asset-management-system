import React from "react";
import {
  Shield,
  LayoutDashboard,
  ShoppingCart,
  ArrowLeftRight,
  UserCheck,
  Users,
  Building2,
  Boxes,
  FileText,
  LogOut,
  Sparkles,
  Compass
} from "lucide-react";

const navigationItems = [
  { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"] },
  { id: "purchases", label: "Asset Acquisition", icon: ShoppingCart, roles: ["ADMIN", "LOGISTICS_OFFICER"] },
  { id: "transfers", label: "Base Transfer Network", icon: ArrowLeftRight, roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"] },
  { id: "assignments", label: "Deployment & Utilization", icon: UserCheck, roles: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"] },
  { id: "users", label: "Personnel Directory", icon: Users, roles: ["ADMIN"] },
  { id: "bases", label: "Strategic Bases", icon: Building2, roles: ["ADMIN"] },
  { id: "equipment-types", label: "Asset Catalog", icon: Boxes, roles: ["ADMIN"] },
  { id: "audit-logs", label: "Enterprise Audit Logs", icon: FileText, roles: ["ADMIN"] }
];

export default function Sidebar({ activeTab, onSelectTab, user, onLogout }) {
  const visibleItems = navigationItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-70 bg-[#080c14] border-r border-[#26334d] flex flex-col justify-between p-5 min-h-screen relative z-20">
      <div>
        {/* Header Branding - Squarespace Essex Executive Style */}
        <div className="flex items-center space-x-3 px-2 py-4 mb-6 border-b border-[#26334d]">
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-sky-400 shadow-lg shadow-sky-500/10">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider text-slate-100 uppercase font-serif-heading">
              ESSEX EXECUTIVE
            </h1>
            <p className="text-[11px] text-sky-400 font-mono tracking-widest uppercase flex items-center mt-0.5">
              <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> Defense Command
            </p>
          </div>
        </div>

        {/* Officer Profile Badge */}
        <div className="essex-card-gold p-4 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 truncate font-serif-heading tracking-wide uppercase">
              {user.name}
            </span>
            <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-widest bg-amber-400 text-slate-950 rounded-full essex-badge">
              {user.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
            {user.baseName || "Global Command HQ"}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 font-mono">
            Executive Suite Controls
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-sky-500/15 text-sky-300 border-l-4 border-sky-400 shadow-lg shadow-sky-500/10 font-semibold"
                    : "text-slate-400 hover:bg-[#0f172a] hover:text-slate-200 border-l-4 border-transparent"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-[#26334d]">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
