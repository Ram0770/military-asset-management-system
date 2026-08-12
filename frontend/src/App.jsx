import React, { useState, useEffect } from "react";
import api from "./api";
import LoginForm from "./components/LoginForm";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PurchasePanel from "./components/PurchasePanel";
import TransferPanel from "./components/TransferPanel";
import AssignmentPanel from "./components/AssignmentPanel";
import UsersPanel from "./components/UsersPanel";
import BasesPanel from "./components/BasesPanel";
import EquipmentTypesPanel from "./components/EquipmentTypesPanel";
import AuditLogsPanel from "./components/AuditLogsPanel";

const pageTitles = {
  dashboard: "Operations Dashboard",
  purchases: "Equipment Purchases",
  transfers: "Cross-Base Transfers",
  assignments: "Assignments & Expenditures",
  users: "User Account Directory",
  bases: "Military Bases Directory",
  "equipment-types": "Equipment Catalog Specifications",
  "audit-logs": "System Audit Trail Explorer"
};

export default function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("mam_token");
    const user = localStorage.getItem("mam_user");
    return token && user ? { token, user: JSON.parse(user) } : null;
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  useEffect(() => {
    if (!session) return;
    loadCommonData();
  }, [session]);

  async function loadCommonData() {
    try {
      const [basesRes, eqRes] = await Promise.all([
        api.get("/bases"),
        api.get("/equipment-types")
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(eqRes.data);
    } catch (err) {
      console.error("Failed to load metadata bases/equipment:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  }

  function handleLogin(payload) {
    localStorage.setItem("mam_token", payload.token);
    localStorage.setItem("mam_user", JSON.stringify(payload.user));
    setSession(payload);
    setActiveTab("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("mam_token");
    localStorage.removeItem("mam_user");
    setSession(null);
  }

  if (!session) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Tactical Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={session.user}
        onLogout={handleLogout}
      />

      {/* Main Command Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title={pageTitles[activeTab] || "Command Portal"} user={session.user} />

        <main className="p-6 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <Dashboard
              user={session.user}
              bases={bases}
              equipmentTypes={equipmentTypes}
            />
          )}

          {activeTab === "purchases" && (
            <PurchasePanel
              user={session.user}
              bases={bases}
              equipmentTypes={equipmentTypes}
            />
          )}

          {activeTab === "transfers" && (
            <TransferPanel
              user={session.user}
              bases={bases}
              equipmentTypes={equipmentTypes}
            />
          )}

          {activeTab === "assignments" && (
            <AssignmentPanel
              user={session.user}
              bases={bases}
              equipmentTypes={equipmentTypes}
            />
          )}

          {activeTab === "users" && (
            <UsersPanel bases={bases} />
          )}

          {activeTab === "bases" && (
            <BasesPanel bases={bases} onRefresh={loadCommonData} />
          )}

          {activeTab === "equipment-types" && (
            <EquipmentTypesPanel equipmentTypes={equipmentTypes} onRefresh={loadCommonData} />
          )}

          {activeTab === "audit-logs" && (
            <AuditLogsPanel bases={bases} />
          )}
        </main>
      </div>
    </div>
  );
}
