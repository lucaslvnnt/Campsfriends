import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Match from "../models/Match.js";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/:matchId", authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.some((id) => String(id) === String(req.user._id))) {
      return res.status(404).json({ error: "Match introuvable" });
    }

    const messages = await Message.find({ matchId: match._id }).sort({ createdAt: 1 });
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/:matchId", authMiddleware, async (req, res) => {
  try {
    const { text, type } = req.body;
    const allowedTypes = new Set(["text", "call_request", "game_request"]);
    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.some((id) => String(id) === String(req.user._id))) {
      return res.status(404).json({ error: "Match introuvable" });
    }

    const safeType = allowedTypes.has(type) ? type : "text";
    const fallbackText =
      safeType === "call_request" ? "Demande d'appel" : safeType === "game_request" ? "Demande de jeu" : "";
    const safeText = text?.trim() || fallbackText;
    if (!safeText) {
      return res.status(400).json({ error: "Message vide" });
    }

    const message = await Message.create({
      matchId: match._id,
      sender: req.user._id,
      text: safeText,
      type: safeType
    });

    match.lastMessageAt = new Date();
    await match.save();

    return res.json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
