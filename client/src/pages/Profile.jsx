import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch, uploadImage } from "../api/api.js";
import { convertHeicToJpeg, isHeicFile } from "../utils/image.js";
import {
  ACCENTS,
  CHAT_BACKGROUNDS,
  PHOTO_EFFECTS,
  PROFILE_EFFECTS,
  getAccent,
  normalizeTheme
} from "../utils/theme.js";

const Profile = () => {
  const { user, setUser } = useAuth();
  const baseTheme = normalizeTheme(user.theme);
  const [form, setForm] = useState({
    firstName: user.firstName,
    age: user.age,
    bio: user.bio,
    interests: user.interests.join(", "),
    profilePicture: user.profilePicture,
    theme: baseTheme
  });
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState(user.profilePicture || "");
  const premiumEnabled = Boolean(user.isPremium);
  const accent = getAccent(form.theme.accent);
  const previewStyle = premiumEnabled
    ? { "--accent": accent.color, "--accent-soft": accent.soft }
    : undefined;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "profilePicture") {
      setPreview(value);
    }
  };

  const handleThemeChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value
      }
    }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      let uploadFile = file;
      if (isHeicFile(file)) {
        uploadFile = await convertHeicToJpeg(file);
      }

      const localPreview = URL.createObjectURL(uploadFile);
      setPreview(localPreview);

      const data = await uploadImage(uploadFile);
      setForm((prev) => ({ ...prev, profilePicture: data.url }));
      setPreview(data.url);
    } catch (err) {
      setUploadError(err.message || "Upload echoue");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };
      if (!premiumEnabled) {
        delete payload.theme;
      }
      const updated = await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      setUser(updated);
      setStatus("Profil mis a jour.");
    } catch (err) {
      setStatus("Echec de mise a jour.");
    }
  };

  return (
    <div className="min-h-screen px-6 pt-10 pb-24 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-display font-semibold">Ton profil</h1>
        <div className="mt-6 glass rounded-3xl p-5 space-y-4">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
            placeholder="Prenom"
          />
          <input
            name="age"
            value={form.age}
            onChange={handleChange}
            type="number"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
            placeholder="Age"
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
            rows={3}
            placeholder="Bio"
          />
          <input
            name="interests"
            value={form.interests}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
            placeholder="Interets"
          />

          <div className="space-y-2">
            <label className="text-sm text-white/70">Photo (upload)</label>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleFileChange}
              className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-coral file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {uploading && <p className="text-xs text-white/60">Upload en cours...</p>}
            {uploadError && <p className="text-xs text-coral">{uploadError}</p>}
          </div>

          <input
            name="profilePicture"
            value={form.profilePicture}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
            placeholder="URL photo (optionnel)"
          />

          {preview && (
            <div className="flex justify-center">
              <div
                style={previewStyle}
                className={`rounded-3xl bg-white/10 p-3 ${
                  premiumEnabled ? `profile-frame profile-effect-${form.theme.profileEffect}` : ""
                }`}
              >
                <img
                  src={preview}
                  alt="Apercu"
                  className={`h-32 w-32 rounded-2xl object-cover border border-white/20 ${
                    premiumEnabled ? `photo-effect-${form.theme.photoEffect}` : ""
                  }`}
                />
              </div>
            </div>
          )}

          <div className="mt-2 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Personnalisation Premium</p>
                <p className="text-xs text-white/60">Couleurs, effets et fond de chat</p>
              </div>
              <span className={`text-xs font-semibold ${premiumEnabled ? "text-emerald-300" : "text-white/50"}`}>
                {premiumEnabled ? "Actif" : "Verrouille"}
              </span>
            </div>
            {!premiumEnabled && (
              <p className="mt-2 text-xs text-white/50">
                Active le Pass Premium dans Reglages pour debloquer la personnalisation.
              </p>
            )}
          </div>

          <div className={`space-y-3 ${premiumEnabled ? "" : "opacity-40 pointer-events-none"}`}>
            <div>
              <label className="text-xs text-white/60">Couleur du profil</label>
              <select
                value={form.theme.accent}
                onChange={(e) => handleThemeChange("accent", e.target.value)}
                className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
              >
                {ACCENTS.map((accentOption) => (
                  <option key={accentOption.id} value={accentOption.id}>
                    {accentOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/60">Cadre de profil</label>
              <select
                value={form.theme.profileEffect}
                onChange={(e) => handleThemeChange("profileEffect", e.target.value)}
                className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
              >
                {PROFILE_EFFECTS.map((effect) => (
                  <option key={effect.id} value={effect.id}>
                    {effect.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/60">Effet photo de profil</label>
              <select
                value={form.theme.photoEffect}
                onChange={(e) => handleThemeChange("photoEffect", e.target.value)}
                className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
              >
                {PHOTO_EFFECTS.map((effect) => (
                  <option key={effect.id} value={effect.id}>
                    {effect.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/60">Fond des messages</label>
              <select
                value={form.theme.chatBackground}
                onChange={(e) => handleThemeChange("chatBackground", e.target.value)}
                className="mt-2 w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
              >
                {CHAT_BACKGROUNDS.map((bg) => (
                  <option key={bg.id} value={bg.id}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold"
          >
            Enregistrer
          </button>
          {status && <p className="text-sm text-white/60">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default Profile;
