import React from "react";
import { Activity, User, Building, ShieldCheck } from "lucide-react";

export default function Navbar({ title, user }) {
  return (
    <header className="h-20 bg-[#080c14]/90 border-b border-[#26334d] px-8 flex items-center justify-between backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-[10px] font-mono font-bold uppercase text-sky-400 tracking-widest flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400 mr-1" />
          Squarespace Essex Fluid Platform
        </p>
        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide font-serif-heading">{title}</h2>
      </div>

      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2 px-4 py-2 bg-[#0f172a] border border-[#26334d] rounded-xl text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">Status:</span>
          <span className="text-emerald-400 font-bold uppercase">ONLINE</span>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 bg-[#0f172a] border border-[#26334d] rounded-xl text-xs font-mono">
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Jurisdiction:</span>
          <span className="text-slate-200 font-semibold">{user.baseName || "Global HQ"}</span>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-xs font-mono">
          <User className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-sky-300 font-bold">{user.name}</span>
        </div>
      </div>
    </header>
  );
}
