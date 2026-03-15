import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api.js";

const Admin = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("reports");

  const loadReports = async () => {
    const data = await apiFetch("/admin/reports");
    setReports(data);
  };

  const loadStats = async () => {
    const data = await apiFetch("/admin/stats");
    setStats(data);
  };

  const loadUsers = async () => {
    const data = await apiFetch("/admin/users");
    setUsers(data);
  };

  useEffect(() => {
    loadReports();
    loadStats();
    loadUsers();
  }, []);

  const handleBan = async (userId) => {
    await apiFetch(`/admin/ban/${userId}`, { method: "POST" });
    loadReports();
    loadStats();
  };

  const handleDelete = async (userId) => {
    await apiFetch(`/admin/user/${userId}`, { method: "DELETE" });
    loadReports();
    loadStats();
    loadUsers();
  };

  const handleResolve = async (reportId) => {
    await apiFetch(`/admin/reports/${reportId}/resolve`, { method: "PATCH" });
    loadReports();
  };

  return (
    <div className="min-h-screen px-6 pt-10 pb-24 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-display font-semibold">Panel admin</h1>
        {stats && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="glass rounded-3xl p-5">
              <p className="text-sm text-white/60">Utilisateurs</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="text-sm text-white/60">Bannis</p>
              <p className="text-2xl font-semibold">{stats.bannedUsers}</p>
            </div>
            <div className="glass rounded-3xl p-5">
              <p className="text-sm text-white/60">Signalements ouverts</p>
              <p className="text-2xl font-semibold">{stats.openReports}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => setTab("reports")}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider ${
              tab === "reports" ? "bg-coral text-white" : "bg-white/10 text-white/70"
            }`}
          >
            Signalements
          </button>
          <button
            onClick={() => setTab("users")}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider ${
              tab === "users" ? "bg-coral text-white" : "bg-white/10 text-white/70"
            }`}
          >
            Comptes
          </button>
        </div>

        {tab === "reports" && (
          <div className="mt-6 space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-white/50">{report.reason}</p>
                    <p className="text-lg font-semibold">
                      {report.reportedUser?.firstName || "Utilisateur"}
                    </p>
                    <p className="text-sm text-white/70">{report.details || "Aucun detail"}</p>
                    <p className="mt-1 text-xs text-white/50">
                      Statut: {report.status === "resolved" ? "resolu" : "ouvert"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleResolve(report._id)}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase"
                    >
                      Resoudre
                    </button>
                    {report.reportedUser && (
                      <>
                        <button
                          onClick={() => handleBan(report.reportedUser._id)}
                          className="rounded-full bg-coral px-4 py-2 text-xs uppercase"
                        >
                          Bannir
                        </button>
                        <button
                          onClick={() => handleDelete(report.reportedUser._id)}
                          className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!reports.length && <p className="text-sm text-white/60">Aucun signalement.</p>}
          </div>
        )}

        {tab === "users" && (
          <div className="mt-6 space-y-4">
            {users.map((account) => (
              <div key={account._id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{account.firstName || "Utilisateur"}</p>
                    <p className="text-xs text-white/60">
                      Email: {account.email || "—"} | Tel: {account.phone || "—"}
                    </p>
                    <p className="text-xs text-white/60">
                      Camping: {account.camping || "—"}
                    </p>
                    <p className="text-xs text-white/60">
                      Role: {account.role} | Premium: {account.isPremium ? "oui" : "non"} |{" "}
                      {account.isBanned ? "banni" : "actif"}
                    </p>
                    <p className="text-xs text-white/40">
                      Mot de passe: protege
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!account.isBanned && (
                      <button
                        onClick={() => handleBan(account._id)}
                        className="rounded-full bg-coral px-4 py-2 text-xs uppercase"
                      >
                        Bannir
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(account._id)}
                      className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!users.length && <p className="text-sm text-white/60">Aucun compte.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
