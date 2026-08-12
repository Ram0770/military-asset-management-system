import React, { useState, useEffect } from "react";
import { Users, Plus, CheckCircle, AlertCircle } from "lucide-react";
import api from "../api";

export default function UsersPanel({ bases }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "LOGISTICS_OFFICER",
    baseId: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await api.post("/users", {
        name: form.name,
        username: form.username,
        email: form.email || null,
        password: form.password,
        role: form.role,
        baseId: form.baseId ? Number(form.baseId) : null
      });

      setMessage({ type: "success", text: "User account created successfully." });
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "LOGISTICS_OFFICER",
        baseId: ""
      });
      fetchUsers();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create user." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="essex-card p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 uppercase tracking-widest flex items-center space-x-3 font-serif-heading">
            <Users className="w-6 h-6 text-sky-400" />
            <span>PERSONNEL & ACCOUNT DIRECTORY (ADMIN ONLY)</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Provision user accounts, assign security roles, and bind officers to strategic military bases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading flex items-center space-x-2">
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Provision Account</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Full Officer Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Commander Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Account Username
              </label>
              <input
                type="text"
                required
                placeholder="e.g. commander.jane"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                placeholder="jane.doe@military.gov"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                RBAC Security Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full"
              >
                <option value="LOGISTICS_OFFICER">LOGISTICS_OFFICER</option>
                <option value="BASE_COMMANDER">BASE_COMMANDER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-1">
                Assigned Base
              </label>
              <select
                value={form.baseId}
                onChange={(e) => setForm({ ...form, baseId: e.target.value })}
                className="w-full"
              >
                <option value="">No Base (Global HQ)</option>
                {bases?.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
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
              {isSubmitting ? "Creating..." : "Create User Account"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 essex-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-serif-heading">
            Active User Directory
          </h3>

          <div className="overflow-x-auto border border-[#26334d] rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#080c14]/90 text-slate-400 font-mono uppercase tracking-wider border-b border-[#26334d]">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Station Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334d]/60 font-mono text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#172033]/60">
                    <td className="p-3.5 font-bold text-slate-100 font-serif-heading">{u.name}</td>
                    <td className="p-3.5 text-sky-400">{u.username}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-[#080c14] text-slate-200 border border-[#26334d] rounded-full">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{u.base?.name || "Global / Unassigned"}</td>
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
