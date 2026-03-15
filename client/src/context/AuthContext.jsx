import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, setToken, getToken } from "../api/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      if (!getToken()) {
        setUser(null);
        return;
      }
      const profile = await apiFetch("/users/me");
      setUser(profile);
    } catch (err) {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = async (payload) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, login, register, logout, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
