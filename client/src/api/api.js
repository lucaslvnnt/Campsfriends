const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || API_URL.replace(/\/api$/, "");

export const getToken = () => localStorage.getItem("campfriend_token");

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("campfriend_token", token);
  } else {
    localStorage.removeItem("campfriend_token");
  }
};

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });
  } catch (err) {
    throw new Error(
      `Serveur injoignable. Verifie que le backend tourne sur ${SERVER_URL}.`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "Requete echouee");
    error.status = res.status;
    throw error;
  }
  return data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  let res;
  try {
    res = await fetch(`${SERVER_URL}/api/uploads`, {
      method: "POST",
      body: formData
    });
  } catch (err) {
    throw new Error(
      `Upload impossible. Verifie que le backend tourne sur ${SERVER_URL}.`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Upload echoue");
  }
  return data;
};

export const getServerUrl = () => SERVER_URL;
