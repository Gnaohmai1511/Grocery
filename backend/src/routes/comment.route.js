import express from "express";
import {
  getCommentsByProduct,
  createComment,
} from "../controllers/comment.controller.js";
import { hasPurchasedProduct } from "../middleware/hasPurchased.middleware.js";

const router = express.Router();

router.get("/:productId", getCommentsByProduct);
router.post("/", hasPurchasedProduct, createComment);

export default router;