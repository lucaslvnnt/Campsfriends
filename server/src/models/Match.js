import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessageAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
