import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { getAccent, normalizeTheme } from "../utils/theme.js";

const SwipeCard = ({ profile, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-10, 10]);
  const opacity = useTransform(x, [-150, 0, 150], [0.6, 1, 0.6]);
  const theme = normalizeTheme(profile?.theme);
  const accent = getAccent(theme.accent);
  const premiumEnabled = Boolean(profile?.isPremium);
  const cardStyle = premiumEnabled
    ? { "--accent": accent.color, "--accent-soft": accent.soft }
    : undefined;
  const profileEffect = premiumEnabled ? `profile-effect-${theme.profileEffect}` : "";
  const photoEffect = premiumEnabled ? `photo-effect-${theme.photoEffect}` : "";

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 120) onSwipe("like");
    else if (info.offset.x < -120) onSwipe("pass");
  };

  return (
    <motion.div
      drag="x"
      style={{ x, rotate, opacity }}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={cardStyle}
      className="relative h-[520px] w-full max-w-sm overflow-hidden rounded-3xl bg-white text-night card-shadow"
    >
      <div className="h-2/3 w-full">
        <div className={`relative h-full w-full ${premiumEnabled ? `profile-frame ${profileEffect}` : ""}`}>
        <img
          src={profile.profilePicture || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60"}
          alt={profile.firstName}
          className={`h-full w-full object-cover rounded-3xl ${photoEffect}`}
        />
        </div>
      </div>
      <div className="flex h-1/3 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-display">
            {profile.firstName}
          </h2>
          <span className={`text-lg font-semibold ${premiumEnabled ? "accent-text" : "text-coral"}`}>
            {profile.age}
          </span>
        </div>
        <p className="text-sm text-slate-600">{profile.camping}</p>
        <p className="text-sm text-slate-700 max-h-16 overflow-hidden">{profile.bio}</p>
        <div className="flex flex-wrap gap-2">
          {profile.interests?.slice(0, 4).map((interest) => (
            <span
              key={interest}
              className={`rounded-full px-3 py-1 text-xs font-semibold text-night ${
                premiumEnabled ? "accent-chip" : "bg-sand"
              }`}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute left-5 top-5 rounded-full bg-night/80 px-3 py-1 text-xs uppercase text-white">
        Glisse
      </div>
    </motion.div>
  );
};

export default SwipeCard;
