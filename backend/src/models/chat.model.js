import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: { type: String, required: true },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  clerkId: {
    type: String,
    required: true,
    index: true,
  },
  title: String,
  messages: [messageSchema],
}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);
