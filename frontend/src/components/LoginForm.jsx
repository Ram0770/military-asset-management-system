import React, { useState } from "react";
import { Shield, Lock, User, KeyRound, AlertCircle, Compass, ArrowRight } from "lucide-react";
import api from "../api";

const demoAccounts = [
  {
    roleLabel: "Executive System Administrator",
    username: "admin",
    password: "admin123",
    roleTag: "ADMIN",
    scope: "Central Command (HQ) / Global Scope"
  },
  {
    roleLabel: "Base Commander (North)",
    username: "commander.north",
    password: "command123",
    roleTag: "COMMANDER",
    scope: "Northern Base (Fort Alpha)"
  },
  {
    roleLabel: "Logistics Officer (South)",
    username: "logistics.south",
    password: "logistics123",
    roleTag: "LOGISTICS",
    scope: "Southern Base (Fort Bravo)"
  }
];

export default function LoginForm({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: "admin", password: "admin123" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", credentials);
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuickFill(acc) {
    setCredentials({ username: acc.username, password: acc.password });
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Squarespace Fluid Ambient Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-8">
        {/* Main Header - Squarespace Essex Theme */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-sky-500/10 border border-sky-500/30 rounded-3xl text-sky-400 shadow-2xl shadow-sky-500/10 mb-2">
            <Compass className="w-12 h-12 text-sky-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-100 uppercase tracking-widest font-serif-heading">
            ESSEX DEFENSE SYSTEM
          </h1>
          <p className="text-xs text-sky-400 font-mono tracking-widest uppercase">
            Military Asset Management Enterprise Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="essex-card p-8 sm:p-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Officer Username / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full pl-11 py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 py-3"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-sky-500/25 flex items-center justify-center space-x-2 font-serif-heading"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? "Authenticating Session..." : "Authorize Access"}</span>
            </button>
          </form>

          {/* Demonstration Accounts */}
          <div className="pt-6 border-t border-[#26334d] space-y-4">
            <p className="text-[10px] font-mono font-bold uppercase text-slate-400 text-center tracking-widest">
              Quick Select Demonstration Accounts
            </p>
            <div className="grid grid-cols-1 gap-3">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="flex items-center justify-between p-4 bg-[#080c14] hover:bg-[#172033] border border-[#26334d] hover:border-sky-500/50 rounded-xl text-left transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-sky-300 font-serif-heading tracking-wide uppercase">
                        {acc.roleLabel}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-[#0f172a] text-sky-400 rounded-full border border-sky-500/20">
                        {acc.username}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{acc.scope}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
