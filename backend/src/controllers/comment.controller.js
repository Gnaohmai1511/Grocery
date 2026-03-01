import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";

/**
 * GET comments by product
 * Lấy danh sách bình luận theo sản phẩm
 */
export async function getCommentsByProduct(req, res) {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getCommentsByProduct:", error);
    res.status(500).json({
      message: "Lỗi máy chủ khi tải bình luận",
    });
  }
}

/**
 * POST comment
 * Tạo bình luận mới
 */
export async function createComment(req, res) {
  try {
    const { userId } = req.auth();
    const { productId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Nội dung bình luận không được để trống",
      });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(401).json({
        message: "Không tìm thấy người dùng",
      });
    }

    const comment = await Comment.create({
      product: productId,
      user: user._id,
      clerkId: userId,
      content,
    });

    res.status(201).json({
      message: "Bình luận đã được đăng thành công",
      comment,
    });
  } catch (error) {
    console.error("Error in createComment:", error);
    res.status(500).json({
      message: "Lỗi máy chủ khi tạo bình luận",
    });
  }
}