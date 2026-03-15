export const DEFAULT_THEME = {
  accent: "coral",
  profileEffect: "none",
  chatBackground: "default",
  photoEffect: "none"
};

export const ACCENTS = [
  { id: "coral", label: "Corail", color: "#ff7a85", soft: "rgba(255, 122, 133, 0.22)" },
  { id: "lagoon", label: "Lagon", color: "#22d3ee", soft: "rgba(34, 211, 238, 0.22)" },
  { id: "lime", label: "Citron", color: "#a3e635", soft: "rgba(163, 230, 53, 0.22)" },
  { id: "violet", label: "Violet", color: "#a78bfa", soft: "rgba(167, 139, 250, 0.22)" },
  { id: "sunset", label: "Sunset", color: "#fb7185", soft: "rgba(251, 113, 133, 0.22)" }
];

export const PROFILE_EFFECTS = [
  { id: "none", label: "Aucun" },
  { id: "glow", label: "Orbite" },
  { id: "halo", label: "Etoiles" },
  { id: "neon", label: "Vague" }
];

export const CHAT_BACKGROUNDS = [
  { id: "default", label: "Nuit" },
  { id: "aurora", label: "Aurore" },
  { id: "sunset", label: "Coucher de soleil" },
  { id: "lagoon", label: "Lagon" },
  { id: "forest", label: "Foret" }
];

export const PHOTO_EFFECTS = [
  { id: "none", label: "Aucun" },
  { id: "soft", label: "Doux" },
  { id: "vivid", label: "Vif" },
  { id: "mono", label: "Mono" },
  { id: "dream", label: "Dream" }
];

export const normalizeTheme = (theme = {}) => ({
  ...DEFAULT_THEME,
  ...(theme || {})
});

export const getAccent = (accentId) => {
  return ACCENTS.find((accent) => accent.id === accentId) || ACCENTS[0];
};
