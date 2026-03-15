import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext.match(/^\.(jpg|jpeg|png|webp|gif)$/) ? ext : ".jpg";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const mime = file.mimetype?.toLowerCase() || "";
  if (mime === "image/heic" || mime === "image/heif") {
    return cb(new Error("Format HEIC non supporte. Utilise JPG ou PNG."));
  }
  if (mime.startsWith("image/")) {
    return cb(null, true);
  }
  return cb(new Error("Type de fichier invalide"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post("/", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Fichier invalide" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier" });
    }

    const origin =
      process.env.SERVER_ORIGIN || `${req.protocol}://${req.get("host")}`;
    const url = `${origin}/uploads/${req.file.filename}`;
    return res.json({ url });
  });
});

export default router;
