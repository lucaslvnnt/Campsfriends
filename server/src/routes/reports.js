import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { reportedUserId, reason, details } = req.body;
    if (!reportedUserId || !reason) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const target = await User.findById(reportedUserId);
    if (!target) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      reason,
      details: details || ""
    });

    return res.json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
