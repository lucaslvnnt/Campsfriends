import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 2000 },
    type: {
      type: String,
      enum: ["text", "call_request", "game_request"],
      default: "text"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
