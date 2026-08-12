import React from "react";
import { X, ArrowUpRight, ArrowDownLeft, PlusCircle, Calculator, CheckCircle2 } from "lucide-react";

export default function NetMovementModal({ metrics, breakdown, onClose }) {
  const purchases = metrics?.purchases || 0;
  const transfersIn = metrics?.transfersIn || 0;
  const transfersOut = metrics?.transfersOut || 0;
  const netMovement = metrics?.netMovement || 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#080c14]/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="essex-card-gold rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-8 py-5 bg-[#080c14]/95 border-b border-[#26334d] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-100 uppercase tracking-widest font-serif-heading">
                NET MOVEMENT FORMULA CALCULATION BREAKDOWN
              </h3>
              <p className="text-xs text-amber-400 font-mono">
                Formula: Net Movement = Purchases (+) + Transfers In (+) - Transfers Out (-)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#0f172a] rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula Cards Row */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {/* Card 1: Purchases */}
            <div className="essex-card p-4 border-emerald-500/40">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center space-x-1">
                <PlusCircle className="w-3 h-3" /> <span>Purchases (+)</span>
              </span>
              <p className="text-2xl font-bold text-emerald-300 font-mono mt-2">
                +{purchases.toLocaleString()}
              </p>
            </div>

            {/* Card 2: Transfers In */}
            <div className="essex-card p-4 border-sky-500/40">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center justify-center space-x-1">
                <ArrowDownLeft className="w-3 h-3" /> <span>Transfers In (+)</span>
              </span>
              <p className="text-2xl font-bold text-sky-300 font-mono mt-2">
                +{transfersIn.toLocaleString()}
              </p>
            </div>

            {/* Card 3: Transfers Out */}
            <div className="essex-card p-4 border-rose-500/40">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center justify-center space-x-1">
                <ArrowUpRight className="w-3 h-3" /> <span>Transfers Out (-)</span>
              </span>
              <p className="text-2xl font-bold text-rose-300 font-mono mt-2">
                -{transfersOut.toLocaleString()}
              </p>
            </div>

            {/* Card 4: Net Movement Result */}
            <div className="essex-card-gold p-4">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3 h-3" /> <span>Total Net Movement</span>
              </span>
              <p className={`text-2xl font-bold font-mono mt-2 ${netMovement >= 0 ? "text-amber-300" : "text-rose-400"}`}>
                {netMovement >= 0 ? `+${netMovement.toLocaleString()}` : netMovement.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Formula Verification Banner */}
          <div className="p-4 bg-[#080c14] border border-[#26334d] rounded-2xl text-center font-mono text-xs text-slate-300">
            <span className="text-slate-500">Expression Verification:</span>{" "}
            <span className="text-emerald-400 font-bold">+{purchases}</span>{" "}
            <span className="text-slate-500">+</span>{" "}
            <span className="text-sky-400 font-bold">+{transfersIn}</span>{" "}
            <span className="text-slate-500">-</span>{" "}
            <span className="text-rose-400 font-bold">{transfersOut}</span>{" "}
            <span className="text-slate-500">=</span>{" "}
            <span className="text-amber-400 font-bold">{netMovement} Total Units</span>
          </div>

          {/* Itemized Activity Log Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Itemized Movement Logs
            </h4>
            <div className="max-h-60 overflow-y-auto border border-[#26334d] rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#080c14]/90 text-slate-400 font-mono sticky top-0 border-b border-[#26334d]">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Equipment</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Origin / Dest</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
                  {breakdown?.purchases?.map((item) => (
                    <tr key={`p-${item.id}`} className="hover:bg-[#172033]/60">
                      <td className="p-3 text-emerald-400 font-semibold">+ Purchase</td>
                      <td className="p-3 text-slate-200">{item.equipmentName}</td>
                      <td className="p-3 text-emerald-400 font-bold">+{item.quantity}</td>
                      <td className="p-3 text-slate-400">{item.vendor}</td>
                      <td className="p-3 text-slate-500 text-[10px]">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {breakdown?.transfersIn?.map((item) => (
                    <tr key={`ti-${item.id}`} className="hover:bg-[#172033]/60">
                      <td className="p-3 text-sky-400 font-semibold">+ Transfer In</td>
                      <td className="p-3 text-slate-200">{item.equipmentName}</td>
                      <td className="p-3 text-sky-400 font-bold">+{item.quantity}</td>
                      <td className="p-3 text-slate-400">From {item.fromBase}</td>
                      <td className="p-3 text-slate-500 text-[10px]">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {breakdown?.transfersOut?.map((item) => (
                    <tr key={`to-${item.id}`} className="hover:bg-[#172033]/60">
                      <td className="p-3 text-rose-400 font-semibold">- Transfer Out</td>
                      <td className="p-3 text-slate-200">{item.equipmentName}</td>
                      <td className="p-3 text-rose-400 font-bold">-{item.quantity}</td>
                      <td className="p-3 text-slate-400">To {item.toBase}</td>
                      <td className="p-3 text-slate-500 text-[10px]">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!breakdown?.purchases?.length && !breakdown?.transfersIn?.length && !breakdown?.transfersOut?.length) && (
                    <tr>
                      <td colSpan={5} className="p-5 text-center text-slate-500 italic">
                        No movement records found for selected scope.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 bg-[#080c14] border-t border-[#26334d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0f172a] hover:bg-[#172033] border border-[#26334d] text-slate-200 rounded-xl text-xs font-bold font-serif-heading uppercase tracking-wider transition-all"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
