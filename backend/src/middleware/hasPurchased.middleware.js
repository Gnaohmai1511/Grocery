import { Order } from "../models/order.model.js";

export async function hasPurchasedProduct(req, res, next) {
  try {
    const { userId } = req.auth(); // Clerk
    const { productId } = req.body;

    const order = await Order.findOne({
      clerkId: userId,
      "orderItems.product": productId,
    });

    if (!order) {
      return res.status(403).json({
        message: "Bạn cần mua sản phẩm này trước khi có thể bình luận",
      });
    }

    next();
  } catch (error) {
    console.error("Purchase check error:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
    });
  }
}