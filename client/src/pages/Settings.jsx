import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../api/api.js";

const Settings = () => {
  const { logout, user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleActivatePremium = async () => {
    const updated = await apiFetch("/users/premium/activate", { method: "POST" });
    setUser(updated);
  };

  const handleCancelPremium = async () => {
    const updated = await apiFetch("/users/premium/cancel", { method: "POST" });
    setUser(updated);
  };

  return (
    <div className="min-h-screen px-6 pt-10 pb-24 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-display font-semibold">Reglages</h1>
        <div className="mt-6 glass rounded-3xl p-5 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Pass Premium</p>
                <p className="text-xs text-white/60">1,99€ / mois</p>
                <p className="mt-2 text-xs text-white/60">
                  Personnalise les couleurs, les effets du profil et le fond des messages.
                </p>
              </div>
              <span className={`text-xs font-semibold ${user?.isPremium ? "text-emerald-300" : "text-white/50"}`}>
                {user?.isPremium ? "Actif" : "Inactif"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {user?.isPremium ? (
                <button
                  onClick={handleCancelPremium}
                  className="rounded-2xl bg-white/10 px-4 py-2 text-xs uppercase tracking-wider"
                >
                  Desactiver
                </button>
              ) : (
                <button
                  onClick={handleActivatePremium}
                  className="rounded-2xl bg-coral px-4 py-2 text-xs uppercase tracking-wider"
                >
                  Activer
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left"
          >
            Se deconnecter
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full rounded-2xl bg-coral px-4 py-3 text-left font-semibold"
            >
              Ouvrir le panel admin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
