import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Decouvrir" },
  { to: "/messages", label: "Messages" },
  { to: "/campings", label: "Campings" },
  { to: "/profile", label: "Profil" },
  { to: "/settings", label: "Reglages" }
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="relative mx-auto max-w-lg">
        <div className="relative rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/25 via-white/5 to-transparent opacity-70" />
          <div className="relative grid grid-cols-5 gap-1 p-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 transition ${
                    isActive
                      ? "bg-white/20 text-white shadow-[0_6px_20px_rgba(255,255,255,0.12)]"
                      : "text-white/70 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="text-[9px]">{item.label}</span>
                    <span
                      className={`h-1 w-1 rounded-full transition ${
                        isActive ? "bg-coral" : "bg-white/30 group-hover:bg-white/60"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
