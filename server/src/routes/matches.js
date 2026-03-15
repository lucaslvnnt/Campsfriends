import express from "express";
import Match from "../models/Match.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const matches = await Match.find({ users: req.user._id }).sort({ lastMessageAt: -1, updatedAt: -1 });

    const enriched = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.users.find((id) => String(id) !== String(req.user._id));
        const otherUser = await User.findById(otherUserId).select(
          "firstName age campingBrand camping bio interests profilePicture"
        );

        return {
          id: match._id,
          lastMessageAt: match.lastMessageAt,
          user: otherUser
        };
      })
    );

    return res.json(enriched.filter((m) => m.user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
