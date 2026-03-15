import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import SwipeCard from "../components/SwipeCard.jsx";
import ReportModal from "../components/ReportModal.jsx";

const Discover = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [matchBanner, setMatchBanner] = useState(null);
  const [infoBanner, setInfoBanner] = useState(null);
  const [reporting, setReporting] = useState(null);

  const loadProfiles = async () => {
    const query = user.camping
      ? `camping=${encodeURIComponent(user.camping)}`
      : `campingBrand=${encodeURIComponent(user.campingBrand || "")}`;
    const data = await apiFetch(`/users/discover?${query}`);
    setProfiles(data);
    setIndex(0);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSwipe = async (action) => {
    const current = profiles[index];
    if (!current) return;
    try {
      const res = await apiFetch(`/users/like/${current._id}`, {
        method: "POST",
        body: JSON.stringify({ action })
      });
      if (res.status === "matched") {
        setMatchBanner(current);
        setTimeout(() => setMatchBanner(null), 2000);
      }
      setIndex((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFriendRequest = async () => {
    const current = profiles[index];
    if (!current) return;
    try {
      const res = await apiFetch(`/users/friend-request/${current._id}`, {
        method: "POST"
      });
      const label =
        res.status === "friends"
          ? `Vous etes maintenant amis avec ${current.firstName}`
          : res.status === "already_sent"
            ? `Demande deja envoyee a ${current.firstName}`
            : `Demande envoyee a ${current.firstName}`;
      setInfoBanner(label);
      setTimeout(() => setInfoBanner(null), 1800);
      setIndex((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (payload) => {
    try {
      await apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({
          reportedUserId: reporting._id,
          ...payload
        })
      });
      setReporting(null);
    } catch (err) {
      console.error(err);
    }
  };

  const currentProfile = profiles[index];

  return (
    <div className="min-h-screen px-6 pt-10 pb-24 text-white">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
        <div className="w-full">
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">Decouvrir</h2>
          <h1 className="text-3xl font-display font-semibold">Campeurs a {user.camping}</h1>
        </div>
        <div className="relative flex w-full justify-center">
          <AnimatePresence>
            {currentProfile ? (
              <motion.div
                key={currentProfile._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <SwipeCard profile={currentProfile} onSwipe={handleSwipe} />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSwipe("pass")}
                    className="rounded-full border border-white/20 px-4 py-3 text-xs uppercase tracking-wider"
                  >
                    Passer
                  </button>
                  <button
                    onClick={handleFriendRequest}
                    className="rounded-full bg-white/15 px-4 py-3 text-xs uppercase tracking-wider text-white/90"
                  >
                    Ajouter en ami
                  </button>
                  <button
                    onClick={() => handleSwipe("like")}
                    className="rounded-full bg-coral px-4 py-3 text-xs uppercase tracking-wider"
                  >
                    J'aime
                  </button>
                </div>
                <button
                  onClick={() => setReporting(currentProfile)}
                  className="mt-4 text-xs uppercase tracking-widest text-white/60"
                >
                  Signaler cet utilisateur
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-3xl p-8 text-center"
              >
                <h3 className="text-xl font-semibold">Plus de profils</h3>
                <p className="mt-2 text-white/60">Reviens plus tard ou change de camping.</p>
                <button
                  onClick={loadProfiles}
                  className="mt-6 rounded-full bg-coral px-6 py-3 text-sm font-semibold"
                >
                  Rafraichir
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {matchBanner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="rounded-3xl bg-white p-8 text-center text-night">
            <h3 className="text-2xl font-display font-semibold">Match !</h3>
            <p className="mt-2 text-slate-600">
              Toi et {matchBanner.firstName} pouvez discuter.
            </p>
          </div>
        </div>
      )}

      {infoBanner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="rounded-3xl bg-white p-8 text-center text-night">
            <h3 className="text-xl font-display font-semibold">Demande d'ami</h3>
            <p className="mt-2 text-slate-600">{infoBanner}</p>
          </div>
        </div>
      )}

      {reporting && (
        <ReportModal onClose={() => setReporting(null)} onSubmit={handleReport} />
      )}
    </div>
  );
};

export default Discover;
