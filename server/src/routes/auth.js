import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const buildToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d"
  });
};

const parseEmailOrPhone = (value) => {
  if (!value) return {};
  const trimmed = value.trim();
  if (trimmed.includes("@")) {
    return { email: trimmed.toLowerCase() };
  }
  return { phone: trimmed };
};

router.post("/register", async (req, res) => {
  try {
    const {
      emailOrPhone,
      password,
      firstName,
      age,
      campingBrand,
      camping,
      bio,
      interests,
      profilePicture
    } = req.body;

    if (!emailOrPhone || !password || !firstName || !age || !campingBrand || !camping) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    const contact = parseEmailOrPhone(emailOrPhone);
    if (!contact.email && !contact.phone) {
      return res.status(400).json({ error: "Email ou telephone requis" });
    }

    const existing = await User.findOne({ $or: [{ email: contact.email }, { phone: contact.phone }] });
    if (existing) {
      return res.status(409).json({ error: "Utilisateur deja existant" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const role = contact.email && adminEmail && contact.email === adminEmail ? "admin" : "user";

    const user = await User.create({
      ...contact,
      passwordHash,
      firstName: firstName.trim(),
      age,
      campingBrand: campingBrand.trim(),
      camping: camping.trim(),
      bio: bio || "",
      interests: Array.isArray(interests) ? interests : [],
      profilePicture: profilePicture || "",
      role
    });

    const token = buildToken(user._id);
    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        age: user.age,
        campingBrand: user.campingBrand,
        camping: user.camping,
        bio: user.bio,
        interests: user.interests,
        profilePicture: user.profilePicture,
        role: user.role,
        isPremium: user.isPremium,
        theme: user.theme
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: "Identifiants manquants" });
    }

    const contact = parseEmailOrPhone(emailOrPhone);
    const user = await User.findOne({ $or: [{ email: contact.email }, { phone: contact.phone }] });
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Utilisateur banni" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = buildToken(user._id);
    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        age: user.age,
        campingBrand: user.campingBrand,
        camping: user.camping,
        bio: user.bio,
        interests: user.interests,
        profilePicture: user.profilePicture,
        role: user.role,
        isPremium: user.isPremium,
        theme: user.theme
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
