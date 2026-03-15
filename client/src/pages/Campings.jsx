import React, { useEffect, useMemo, useState } from "react";
import { BRANDS, CAMPINGS_BY_BRAND, findBrandByCamping } from "../data/campings-fr.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../api/api.js";

const Campings = () => {
  const { user, setUser } = useAuth();
  const initialBrand = user.campingBrand || findBrandByCamping(user.camping);
  const [campingBrand, setCampingBrand] = useState(initialBrand);
  const [camping, setCamping] = useState(user.camping || "");
  const [status, setStatus] = useState("");

  const campingsForBrand = useMemo(
    () => CAMPINGS_BY_BRAND[campingBrand] || [],
    [campingBrand]
  );

  useEffect(() => {
    if (!campingsForBrand.length) return;
    if (!campingsForBrand.some((item) => item.label === camping)) {
      setCamping(campingsForBrand[0]?.label || "");
    }
  }, [campingsForBrand, camping]);

  const handleBrandChange = (event) => {
    const brand = event.target.value;
    setCampingBrand(brand);
    const nextCamping = CAMPINGS_BY_BRAND[brand]?.[0]?.label || "";
    setCamping(nextCamping);
  };

  const handleSave = async () => {
    try {
      const updated = await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({ campingBrand, camping })
      });
      setUser(updated);
      setStatus("Camping mis a jour.");
    } catch (err) {
      setStatus("Echec de mise a jour.");
    }
  };

  return (
    <div className="min-h-screen px-6 pt-10 pb-24 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-display font-semibold">Campings</h1>
        <p className="mt-2 text-white/70">
          Choisis ton enseigne, puis ton camping exact.
        </p>
        <div className="mt-6 glass rounded-3xl p-5 space-y-3">
          <label className="text-sm text-white/70">Enseigne</label>
          <select
            value={campingBrand}
            onChange={handleBrandChange}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
          >
            {BRANDS.map((brand) => (
              <option key={brand} value={brand} className="text-night">
                {brand}
              </option>
            ))}
          </select>

          <label className="text-sm text-white/70">Camping</label>
          <select
            value={camping}
            onChange={(e) => setCamping(e.target.value)}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
          >
            {campingsForBrand.map((camp) => (
              <option key={camp.label} value={camp.label} className="text-night">
                {camp.label}
              </option>
            ))}
          </select>

          {!campingsForBrand.length && (
            <p className="text-xs text-white/60">Aucun camping trouve pour cette enseigne.</p>
          )}

          <button
            onClick={handleSave}
            className="mt-2 w-full rounded-2xl bg-coral px-4 py-3 font-semibold"
          >
            Enregistrer
          </button>
          {status && <p className="mt-2 text-sm text-white/60">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default Campings;
