import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).populate("reportedUser", "firstName camping");
    return res.json(reports);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("firstName email phone campingBrand camping role isPremium isBanned createdAt");
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.patch("/reports/:id/resolve", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );
    return res.json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/ban/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true },
      { new: true }
    );
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.delete("/user/:userId", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    return res.json({ status: "deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const openReports = await Report.countDocuments({ status: "open" });
    return res.json({ totalUsers, bannedUsers, openReports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
