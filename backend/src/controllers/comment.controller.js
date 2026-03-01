import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";

/**
 * GET comments by product
 */
export async function getCommentsByProduct(req, res) {
  const { productId } = req.params;

  const comments = await Comment.find({ product: productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json(comments);
}

/**
 * POST comment
 */
export async function createComment(req, res) {
  const { userId } = req.auth();
  const { productId, content } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({ message: "Comment is required" });
  }

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const comment = await Comment.create({
    product: productId,
    user: user._id,
    clerkId: userId,
    content,
  });

  res.status(201).json(comment);
}