import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import matchRoutes from "./routes/matches.js";
import messageRoutes from "./routes/messages.js";
import reportRoutes from "./routes/reports.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/uploads.js";
import { attachChatHandlers } from "./sockets/chat.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true }
});

attachChatHandlers(io);

const start = async () => {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campfriend";
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
