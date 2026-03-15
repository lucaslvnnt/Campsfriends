import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { uploadImage } from "../api/api.js";
import { BRANDS, CAMPINGS_BY_BRAND } from "../data/campings-fr.js";
import { convertHeicToJpeg, isHeicFile } from "../utils/image.js";

const defaultBrand = BRANDS[0];
const defaultCamping = CAMPINGS_BY_BRAND[defaultBrand]?.[0]?.label || "";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
    firstName: "",
    age: "",
    campingBrand: defaultBrand,
    camping: defaultCamping,
    bio: "",
    interests: "",
    profilePicture: ""
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState("");

  const campingsForBrand = CAMPINGS_BY_BRAND[form.campingBrand] || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "profilePicture") {
      setPreview(value);
    }
  };

  const handleBrandChange = (event) => {
    const brand = event.target.value;
    const nextCamping = CAMPINGS_BY_BRAND[brand]?.[0]?.label || "";
    setForm((prev) => ({
      ...prev,
      campingBrand: brand,
      camping: nextCamping
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const ageNumber = Number(form.age);
    if (!form.emailOrPhone || !form.password || !form.firstName || !form.campingBrand || !form.camping) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    if (Number.isNaN(ageNumber) || ageNumber < 13) {
      setError("Age minimum: 13 ans.");
      return;
    }

    try {
      await register({
        ...form,
        age: ageNumber,
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Inscription impossible");
    }
  };

  return (
    <div className="min-h-screen px-6 pt-12 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-display font-semibold">Rejoins CampFriend</h1>
        <p className="mt-2 text-white/70">Cree ton profil en quelques minutes.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="emailOrPhone"
            value={form.emailOrPhone}
            onChange={handleChange}
            placeholder="Email ou telephone"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
          />
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Prenom"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
          />
          <input
            name="age"
            value={form.age}
            onChange={handleChange}
            type="number"
            placeholder="Age"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
          />

          <div className="space-y-3">
            <label className="text-sm text-white/70">Enseigne</label>
            <select
              name="campingBrand"
              value={form.campingBrand}
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
              name="camping"
              value={form.camping}
              onChange={handleChange}
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
          </div>

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio courte"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
            rows={3}
          />
          <input
            name="interests"
            value={form.interests}
            onChange={handleChange}
            placeholder="Interets (separes par des virgules)"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
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
            placeholder="URL photo (optionnel)"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
          />

          {preview && (
            <div className="mt-2 flex justify-center">
              <img
                src={preview}
                alt="Apercu"
                className="h-32 w-32 rounded-2xl object-cover border border-white/20"
              />
            </div>
          )}

          {error && <p className="text-sm text-coral">{error}</p>}
          <button className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold">
            Creer un compte
          </button>
        </form>
        <p className="mt-6 text-sm text-white/70">
          Deja un compte ? <Link to="/login" className="text-coral">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
