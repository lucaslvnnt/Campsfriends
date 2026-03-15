import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Match from "../models/Match.js";
import Message from "../models/Message.js";

export const attachChatHandlers = (io) => {
  const allowedTypes = new Set(["text", "call_request", "game_request"]);

  const defaultTextForType = (type) => {
    if (type === "call_request") return "Demande d'appel";
    if (type === "game_request") return "Demande de jeu";
    return "";
  };

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
      const user = await User.findById(payload.userId);
      if (!user || user.isBanned) return next(new Error("Unauthorized"));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", async (matchId) => {
      const match = await Match.findById(matchId);
      if (!match) return;
      const isMember = match.users.some((id) => String(id) === String(socket.user._id));
      if (!isMember) return;
      socket.join(matchId);
    });

    socket.on("message", async ({ matchId, text, type }) => {
      if (!matchId) return;
      const match = await Match.findById(matchId);
      if (!match) return;
      const isMember = match.users.some((id) => String(id) === String(socket.user._id));
      if (!isMember) return;

      const safeType = allowedTypes.has(type) ? type : "text";
      const safeText = text?.trim() || defaultTextForType(safeType);
      if (!safeText) return;

      const message = await Message.create({
        matchId,
        sender: socket.user._id,
        text: safeText,
        type: safeType
      });
      match.lastMessageAt = new Date();
      await match.save();

      io.to(matchId).emit("message", {
        _id: message._id,
        matchId,
        sender: socket.user._id,
        text: message.text,
        type: message.type,
        createdAt: message.createdAt
      });
    });
  });
};
