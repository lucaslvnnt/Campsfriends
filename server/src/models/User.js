import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    accent: { type: String, default: "coral" },
    profileEffect: { type: String, default: "none" },
    chatBackground: { type: String, default: "default" },
    photoEffect: { type: String, default: "none" }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 13, max: 120 },
    campingBrand: { type: String, default: "", trim: true },
    camping: { type: String, required: true, trim: true },
    bio: { type: String, default: "", trim: true, maxlength: 280 },
    interests: { type: [String], default: [] },
    profilePicture: { type: String, default: "" },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    passes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    matches: { type: [mongoose.Schema.Types.ObjectId], ref: "Match", default: [] },
    friends: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    friendRequestsIn: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    friendRequestsOut: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    isPremium: { type: Boolean, default: false },
    premiumPlan: { type: String, default: "" },
    premiumSince: { type: Date, default: null },
    theme: { type: themeSchema, default: () => ({}) },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
