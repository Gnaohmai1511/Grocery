import express from "express";
import { askAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/ask", askAI);

router.get("/history/:clerkId", async (req, res) => {
  const chats = await Chat.find({ clerkId: req.params.clerkId })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select("title updatedAt");

  res.json(chats);
});

export default router;
