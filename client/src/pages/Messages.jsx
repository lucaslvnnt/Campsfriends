import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { apiFetch, getToken } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getAccent, normalizeTheme } from "../utils/theme.js";

const Messages = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const activeMatchRef = useRef(null);
  const theme = normalizeTheme(user?.theme);
  const accent = getAccent(theme.accent);
  const premiumEnabled = Boolean(user?.isPremium);
  const containerStyle = premiumEnabled
    ? { "--accent": accent.color, "--accent-soft": accent.soft }
    : undefined;
  const chatBgClass = premiumEnabled ? `chat-bg-${theme.chatBackground}` : "chat-bg-default";

  const loadMatches = async () => {
    const data = await apiFetch("/matches");
    setMatches(data);
  };

  const loadMessages = async (matchId) => {
    const data = await apiFetch(`/messages/${matchId}`);
    setMessages(data);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    activeMatchRef.current = activeMatch?.id || null;
  }, [activeMatch]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token: getToken() }
    });

    socketRef.current.on("message", (payload) => {
      if (payload.matchId === activeMatchRef.current) {
        setMessages((prev) => [...prev, payload]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleSelect = async (match) => {
    setActiveMatch(match);
    await loadMessages(match.id);
    socketRef.current?.emit("join", match.id);
  };

  const handleSend = async () => {
    if (!text.trim() || !activeMatch) return;
    socketRef.current?.emit("message", { matchId: activeMatch.id, text, type: "text" });
    setText("");
  };

  const handleQuickRequest = (type) => {
    if (!activeMatch) return;
    socketRef.current?.emit("message", { matchId: activeMatch.id, type });
  };

  const renderMessage = (msg) => {
    const type = msg.type || "text";
    const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "";

    if (type === "call_request" || type === "game_request") {
      const label = type === "call_request" ? "Demande d'appel" : "Demande de jeu";
      const details = msg.text && msg.text !== label ? msg.text : "";
      return (
        <div
          key={msg._id || msg.createdAt}
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3"
        >
          <p className="text-sm font-semibold">{label}</p>
          {details && <p className="text-xs text-white/60">{details}</p>}
          <p className="text-[10px] text-white/50">{time}</p>
        </div>
      );
    }

    return (
      <div key={msg._id || msg.createdAt} className="rounded-2xl bg-white/10 px-4 py-2">
        <p className="text-sm">{msg.text}</p>
        <p className="text-[10px] text-white/50">{time}</p>
      </div>
    );
  };

  return (
    <div
      style={containerStyle}
      className={`min-h-screen px-6 pt-10 pb-24 text-white ${chatBgClass}`}
    >
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[280px_1fr]">
        <div className="glass rounded-3xl p-4">
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">Messages</h2>
          <div className="mt-4 space-y-3">
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => handleSelect(match)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition ${
                  activeMatch?.id === match.id ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10">
                  <img
                    src={match.user?.profilePicture || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=60"}
                    alt={match.user?.firstName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{match.user?.firstName}</p>
                  <p className="text-xs text-white/60">{match.user?.camping}</p>
                </div>
              </button>
            ))}
            {!matches.length && (
              <p className="text-sm text-white/60">Aucun match pour le moment.</p>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-4 min-h-[420px] flex flex-col">
          {activeMatch ? (
            <>
              <div className="mb-4 flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-semibold">Discussion avec {activeMatch.user?.firstName}</h3>
                  <p className="text-xs text-white/60">{activeMatch.user?.camping}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickRequest("call_request")}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wider text-white/80 hover:text-white"
                  >
                    Appeler
                  </button>
                  <button
                    onClick={() => handleQuickRequest("game_request")}
                    className="rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wider text-white/90 hover:bg-white/20"
                  >
                    Jeux
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {messages.map((msg) => renderMessage(msg))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ton message"
                  className="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-white placeholder:text-white/50"
                />
                <button
                  onClick={handleSend}
                  className="rounded-2xl bg-coral px-5 py-3 text-sm font-semibold"
                >
                  Envoyer
                </button>
              </div>
            </>
          ) : (
            <div className="m-auto text-center">
              <h3 className="text-xl font-semibold">Selectionne un match</h3>
              <p className="text-sm text-white/60">Discute des que tu match.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
