import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login({ emailOrPhone, password });
      navigate("/");
    } catch (err) {
      setError(err.message || "Connexion impossible");
    }
  };

  return (
    <div className="min-h-screen px-6 pt-16 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-display font-semibold">Bon retour</h1>
        <p className="mt-2 text-white/70">Connecte-toi pour swiper et discuter.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="Email ou telephone"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
          />
          {error && <p className="text-sm text-coral">{error}</p>}
          <button className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold">
            Se connecter
          </button>
        </form>
        <p className="mt-6 text-sm text-white/70">
          Nouveau ici ? <Link to="/register" className="text-coral">Cree un compte</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
