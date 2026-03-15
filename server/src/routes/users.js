import express from "express";
import User from "../models/User.js";
import Match from "../models/Match.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  const user = req.user;
  return res.json({
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
  });
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const fields = [
      "firstName",
      "age",
      "campingBrand",
      "camping",
      "bio",
      "interests",
      "profilePicture"
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    if (req.body.theme && req.user.isPremium) {
      const allowedThemeFields = ["accent", "profileEffect", "chatBackground", "photoEffect"];
      const nextTheme = { ...(req.user.theme?.toObject?.() || req.user.theme || {}) };
      allowedThemeFields.forEach((field) => {
        if (typeof req.body.theme[field] === "string") {
          nextTheme[field] = req.body.theme[field];
        }
      });
      req.user.theme = nextTheme;
    }

    await req.user.save();

    return res.json({
      id: req.user._id,
      firstName: req.user.firstName,
      age: req.user.age,
      campingBrand: req.user.campingBrand,
      camping: req.user.camping,
      bio: req.user.bio,
      interests: req.user.interests,
      profilePicture: req.user.profilePicture,
      role: req.user.role,
      isPremium: req.user.isPremium,
      theme: req.user.theme
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/premium/activate", authMiddleware, async (req, res) => {
  try {
    req.user.isPremium = true;
    req.user.premiumPlan = "premium_monthly_1_99";
    req.user.premiumSince = new Date();
    await req.user.save();
    return res.json({
      id: req.user._id,
      firstName: req.user.firstName,
      age: req.user.age,
      campingBrand: req.user.campingBrand,
      camping: req.user.camping,
      bio: req.user.bio,
      interests: req.user.interests,
      profilePicture: req.user.profilePicture,
      role: req.user.role,
      isPremium: req.user.isPremium,
      theme: req.user.theme
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/premium/cancel", authMiddleware, async (req, res) => {
  try {
    req.user.isPremium = false;
    req.user.premiumPlan = "";
    req.user.premiumSince = null;
    await req.user.save();
    return res.json({
      id: req.user._id,
      firstName: req.user.firstName,
      age: req.user.age,
      campingBrand: req.user.campingBrand,
      camping: req.user.camping,
      bio: req.user.bio,
      interests: req.user.interests,
      profilePicture: req.user.profilePicture,
      role: req.user.role,
      isPremium: req.user.isPremium,
      theme: req.user.theme
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/discover", authMiddleware, async (req, res) => {
  try {
    const { camping, campingBrand } = req.query;
    const excludeIds = [
      req.user._id,
      ...req.user.likes,
      ...req.user.passes
    ];

    const query = {
      _id: { $nin: excludeIds },
      isBanned: false
    };
    if (camping) {
      query.camping = camping;
    } else if (campingBrand) {
      query.campingBrand = campingBrand;
    }

    const users = await User.find(query)
      .select("firstName age campingBrand camping bio interests profilePicture isPremium theme")
      .limit(20);

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/like/:id", authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;
    const { action } = req.body;

    if (targetId === String(req.user._id)) {
      return res.status(400).json({ error: "Impossible de se liker" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser || targetUser.isBanned) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (action === "pass") {
      await User.updateOne(
        { _id: req.user._id },
        { $addToSet: { passes: targetId } }
      );
      return res.json({ status: "passed" });
    }

    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { likes: targetId } }
    );

    const targetLiked = targetUser.likes.some((id) => String(id) === String(req.user._id));
    if (targetLiked) {
      let match = await Match.findOne({ users: { $all: [req.user._id, targetId] } });
      if (!match) {
        match = await Match.create({ users: [req.user._id, targetId] });
        await User.updateMany(
          { _id: { $in: [req.user._id, targetId] } },
          { $addToSet: { matches: match._id } }
        );
      }
      return res.json({ status: "matched", matchId: match._id });
    }

    return res.json({ status: "liked" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/friend-request/:id", authMiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === String(req.user._id)) {
      return res.status(400).json({ error: "Impossible de s'ajouter soi-meme" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser || targetUser.isBanned) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const alreadyFriends = (req.user.friends || []).some((id) => String(id) === String(targetId));
    if (alreadyFriends) {
      return res.json({ status: "already_friends" });
    }

    const alreadySent = (req.user.friendRequestsOut || []).some(
      (id) => String(id) === String(targetId)
    );
    if (alreadySent) {
      return res.json({ status: "already_sent" });
    }

    const incoming = (req.user.friendRequestsIn || []).some((id) => String(id) === String(targetId));
    if (incoming) {
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { friendRequestsIn: targetId }, $addToSet: { friends: targetId } }
      );
      await User.updateOne(
        { _id: targetId },
        { $pull: { friendRequestsOut: req.user._id }, $addToSet: { friends: req.user._id } }
      );
      return res.json({ status: "friends" });
    }

    await User.updateOne({ _id: req.user._id }, { $addToSet: { friendRequestsOut: targetId } });
    await User.updateOne({ _id: targetId }, { $addToSet: { friendRequestsIn: req.user._id } });

    return res.json({ status: "requested" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
